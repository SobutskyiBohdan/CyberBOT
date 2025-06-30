const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ms = require('ms');
const fs = require('fs');
const path = require('path');

// Шлях до файлу з активними розіграшами
const giveawaysPath = path.join(__dirname, '../data/giveaways.json');

// Функція для завантаження активних розіграшів
function loadGiveaways() {
  if (fs.existsSync(giveawaysPath)) {
    return JSON.parse(fs.readFileSync(giveawaysPath, 'utf8'));
  }
  return [];
}

// Функція для збереження активних розіграшів
function saveGiveaways(giveaways) {
  // Створюємо директорію, якщо вона не існує
  const dir = path.dirname(giveawaysPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(giveawaysPath, JSON.stringify(giveaways, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Організовує розіграш призів на сервері')
    .addSubcommand(subcommand =>
      subcommand
        .setName('start')
        .setDescription('Почати новий розіграш')
        .addStringOption(option => 
          option.setName('час')
            .setDescription('Тривалість розіграшу (30s, 5m, 1h, 2d, тощо)')
            .setRequired(true))
        .addIntegerOption(option => 
          option.setName('переможці')
            .setDescription('Кількість переможців')
            .setRequired(true)
            .setMinValue(1))
        .addStringOption(option => 
          option.setName('приз')
            .setDescription('Приз, який буде розіграно')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('end')
        .setDescription('Завершити розіграш достроково')
        .addStringOption(option => 
          option.setName('message_id')
            .setDescription('ID повідомлення з розіграшем')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('reroll')
        .setDescription('Перевизначити переможців розіграшу')
        .addStringOption(option => 
          option.setName('message_id')
            .setDescription('ID повідомлення з розіграшем')
            .setRequired(true))
        .addIntegerOption(option => 
          option.setName('переможці')
            .setDescription('Кількість нових переможців')
            .setRequired(false)
            .setMinValue(1)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('Показати список активних розіграшів'))
    .setDefaultMemberPermissions(0x0000000000000020), // MANAGE_GUILD permission
  
  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand();

    switch (subCommand) {
      case 'start': {
        const durationStr = interaction.options.getString('час');
        const winners = interaction.options.getInteger('переможці');
        const prize = interaction.options.getString('приз');
        
        const duration = ms(durationStr);
        if (!duration) {
          return interaction.reply({ 
            content: 'Будь ласка, вкажіть коректний час (30s, 5m, 1h, 2d, тощо)', 
            ephemeral: true 
          });
        }
        
        try {
          const endTime = Date.now() + duration;
          const giveawayEmbed = new EmbedBuilder()
            .setColor('#FF9900')
            .setTitle('🎉 РОЗІГРАШ! 🎉')
            .setDescription(`**Приз: ${prize}**\n\nРеагуйте на 🎉, щоб взяти участь!\nЧас закінчення: <t:${Math.floor(endTime / 1000)}:R>\nКількість переможців: ${winners}`)
            .setFooter({ text: `Організатор: ${interaction.user.tag} • ID: ${interaction.id}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

          await interaction.reply('Створюю розіграш...');
          const giveawayMessage = await interaction.channel.send({ embeds: [giveawayEmbed] });
          await giveawayMessage.react('🎉');

          // Зберігаємо інформацію про розіграш
          const giveaways = loadGiveaways();
          giveaways.push({
            messageId: giveawayMessage.id,
            channelId: interaction.channel.id,
            guildId: interaction.guild.id,
            prize,
            winners,
            endTime,
            hostId: interaction.user.id,
            ended: false
          });
          saveGiveaways(giveaways);

          // Створюємо таймер для завершення розіграшу
          setTimeout(() => {
            endGiveaway(interaction.client, giveawayMessage.id);
          }, duration);

          await interaction.editReply(`Розіграш запущено! Закінчиться через ${durationStr}.`);
        } catch (error) {
          console.error('Error starting giveaway:', error);
          await interaction.reply({ 
            content: `❌ Виникла помилка при запуску розіграшу: ${error.message}`, 
            ephemeral: true 
          });
        }
        break;
      }

      case 'end': {
        const messageId = interaction.options.getString('message_id');
        await interaction.deferReply({ ephemeral: true });
        
        const result = await endGiveaway(interaction.client, messageId);
        if (result) {
          await interaction.editReply('Розіграш завершено достроково.');
        } else {
          await interaction.editReply('Не вдалося знайти активний розіграш з вказаним ID.');
        }
        break;
      }

      case 'reroll': {
        const messageId = interaction.options.getString('message_id');
        const rerollWinners = interaction.options.getInteger('переможці') || 1;
        
        await interaction.deferReply({ ephemeral: true });
        const result = await rerollGiveaway(interaction.client, messageId, rerollWinners);
        
        if (result) {
          await interaction.editReply(`Перерозіграш виконано для ${rerollWinners} переможців.`);
        } else {
          await interaction.editReply('Не вдалося знайти завершений розіграш з вказаним ID.');
        }
        break;
      }

      case 'list': {
        const giveaways = loadGiveaways().filter(g => !g.ended && g.guildId === interaction.guild.id);
        
        if (giveaways.length === 0) {
          return interaction.reply('На цьому сервері наразі немає активних розіграшів.');
        }

        const listEmbed = new EmbedBuilder()
          .setColor('#FF9900')
          .setTitle('📋 Активні розіграші')
          .setDescription(giveaways.map(g => 
            `**Приз:** ${g.prize}\n**Переможців:** ${g.winners}\n**Закінчується:** <t:${Math.floor(g.endTime / 1000)}:R>\n**ID:** ${g.messageId}\n`
          ).join('\n'))
          .setTimestamp();

        await interaction.reply({ embeds: [listEmbed] });
        break;
      }
    }
  },
};

// Функція для завершення розіграшу
async function endGiveaway(client, messageId) {
  const giveaways = loadGiveaways();
  const giveawayIndex = giveaways.findIndex(g => g.messageId === messageId);

  if (giveawayIndex === -1) return false;

  const giveaway = giveaways[giveawayIndex];
  if (giveaway.ended) return false;

  giveaway.ended = true;
  saveGiveaways(giveaways);

  try {
    const guild = client.guilds.cache.get(giveaway.guildId);
    if (!guild) return false;

    const channel = guild.channels.cache.get(giveaway.channelId);
    if (!channel) return false;

    const message = await channel.messages.fetch(giveaway.messageId);
    if (!message) return false;

    const reaction = message.reactions.cache.get('🎉');
    if (!reaction) return false;

    // Отримуємо учасників розіграшу
    await reaction.users.fetch();
    const participants = reaction.users.cache.filter(u => !u.bot);

    // Визначаємо переможців
    const winners = [];
    if (participants.size > 0) {
      const participantsArray = Array.from(participants.values());
      for (let i = 0; i < Math.min(giveaway.winners, participants.size); i++) {
        const winnerIndex = Math.floor(Math.random() * participantsArray.length);
        winners.push(participantsArray[winnerIndex]);
        participantsArray.splice(winnerIndex, 1);
      }
    }

    // Оновлюємо ембед
    const endEmbed = new EmbedBuilder()
      .setColor(winners.length > 0 ? '#00FF00' : '#FF0000')
      .setTitle('🎉 РОЗІГРАШ ЗАВЕРШЕНО! 🎉')
      .setDescription(`**Приз: ${giveaway.prize}**\n\n${winners.length > 0 
        ? `Переможці: ${winners.map(w => `<@${w.id}>`).join(', ')}` 
        : 'Немає переможців! Недостатньо учасників.'}`)
      .setFooter({ text: `Організатор: ${(await guild.members.fetch(giveaway.hostId)).user.tag} • ID: ${giveaway.messageId}`, iconURL: (await guild.members.fetch(giveaway.hostId)).user.displayAvatarURL() })
      .setTimestamp();

    await message.edit({ embeds: [endEmbed] });

    // Оголошуємо переможців
    if (winners.length > 0) {
      channel.send({
        content: `Вітаємо ${winners.map(w => `<@${w.id}>`).join(', ')}! Ви виграли **${giveaway.prize}**!`,
        allowedMentions: { users: winners.map(w => w.id) }
      });
    } else {
      channel.send('Розіграш завершено, але недостатньо учасників для визначення переможців!');
    }
    
    return true;
  } catch (error) {
    console.error('Error ending giveaway:', error);
    return false;
  }
}

// Функція для перерозіграшу
async function rerollGiveaway(client, messageId, winnersCount) {
  const giveaways = loadGiveaways();
  const giveaway = giveaways.find(g => g.messageId === messageId);

  if (!giveaway || !giveaway.ended) return false;

  try {
    const guild = client.guilds.cache.get(giveaway.guildId);
    if (!guild) return false;

    const channel = guild.channels.cache.get(giveaway.channelId);
    if (!channel) return false;

    const message = await channel.messages.fetch(giveaway.messageId);
    if (!message) return false;

    const reaction = message.reactions.cache.get('🎉');
    if (!reaction) return false;

    // Отримуємо учасників розіграшу
    await reaction.users.fetch();
    const participants = reaction.users.cache.filter(u => !u.bot);

    // Визначаємо переможців
    const winners = [];
    if (participants.size > 0) {
      const participantsArray = Array.from(participants.values());
      for (let i = 0; i < Math.min(winnersCount, participants.size); i++) {
        const winnerIndex = Math.floor(Math.random() * participantsArray.length);
        winners.push(participantsArray[winnerIndex]);
        participantsArray.splice(winnerIndex, 1);
      }
    }

    // Оголошуємо переможців
    if (winners.length > 0) {
      channel.send({
        content: `🎉 **ПЕРЕРОЗІГРАШ** 🎉\nНові переможці для призу **${giveaway.prize}**: ${winners.map(w => `<@${w.id}>`).join(', ')}!`,
        allowedMentions: { users: winners.map(w => w.id) }
      });
    } else {
      channel.send('Перерозіграш виконано, але недостатньо учасників для визначення переможців!');
    }
    
    return true;
  } catch (error) {
    console.error('Error rerolling giveaway:', error);
    return false;
  }
}

// Ініціалізація активних розіграшів при запуску бота
module.exports.init = async (client) => {
  const giveaways = loadGiveaways();
  const now = Date.now();

  for (const giveaway of giveaways) {
    if (!giveaway.ended) {
      const timeLeft = giveaway.endTime - now;
      
      if (timeLeft <= 0) {
        // Якщо розіграш вже мав закінчитися
        endGiveaway(client, giveaway.messageId);
      } else {
        // Створюємо таймер для завершення розіграшу
        setTimeout(() => {
          endGiveaway(client, giveaway.messageId);
        }, timeLeft);
      }
    }
  }
};