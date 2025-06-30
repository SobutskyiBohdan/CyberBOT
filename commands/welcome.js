// commands/welcome.js
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Шлях до файлу з налаштуваннями
const settingsPath = path.join(__dirname, '../data/welcome-settings.json');

// Функція для завантаження налаштувань
function loadSettings() {
  if (fs.existsSync(settingsPath)) {
    return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  }
  return {};
}

// Функція для збереження налаштувань
function saveSettings(settings) {
  // Створюємо директорію, якщо вона не існує
  const dir = path.dirname(settingsPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

module.exports = {
  name: 'welcome',
  description: 'Налаштовує повідомлення привітання для нових користувачів',
  modOnly: true,
  async execute(message, args) {
    if (!message.member.permissions.has('ManageGuild')) {
      return message.reply('У вас немає прав на налаштування привітань!');
    }
    
    if (!args[0]) {
      return message.reply('Використання: !welcome <channel/message/test/toggle/info> [налаштування]');
    }
    
    const settings = loadSettings();
    const guildId = message.guild.id;
    
    // Ініціалізуємо налаштування для сервера, якщо їх ще немає
    if (!settings[guildId]) {
      settings[guildId] = {
        enabled: false,
        channelId: null,
        message: 'Вітаємо {user} на сервері {server}! Ви наш {count}-й учасник!'
      };
    }
    
    const option = args[0].toLowerCase();
    
    switch (option) {
      case 'channel':
        if (!args[1]) {
          return message.reply('Будь ласка, вкажіть канал для привітань!');
        }
        
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
        if (!channel) {
          return message.reply('Не вдалося знайти цей канал!');
        }
        
        settings[guildId].channelId = channel.id;
        saveSettings(settings);
        
        message.reply(`Канал привітань встановлено на ${channel}`);
        break;
        
      case 'message':
        if (!args[1]) {
          return message.reply('Будь ласка, вкажіть повідомлення привітання!\nВи можете використовувати {user} для згадки користувача, {server} для назви сервера, {count} для кількості учасників.');
        }
        
        const welcomeMessage = args.slice(1).join(' ');
        settings[guildId].message = welcomeMessage;
        saveSettings(settings);
        
        message.reply(`Повідомлення привітання встановлено на:\n${welcomeMessage}`);
        break;
        
      case 'test':
        if (!settings[guildId].channelId) {
          return message.reply('Спочатку налаштуйте канал привітань!');
        }
        
        const testChannel = message.guild.channels.cache.get(settings[guildId].channelId);
        if (!testChannel) {
          return message.reply('Вказаний канал не існує!');
        }
        
        const testMessage = settings[guildId].message
          .replace('{user}', `<@${message.author.id}>`)
          .replace('{server}', message.guild.name)
          .replace('{count}', message.guild.memberCount.toString());
          
        const testEmbed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('🎉 Новий учасник!')
          .setDescription(testMessage)
          .setThumbnail(message.author.displayAvatarURL())
          .setTimestamp();
          
        await testChannel.send({ embeds: [testEmbed] });
        message.reply('Тестове повідомлення привітання відправлено!');
        break;
        
      case 'toggle':
        settings[guildId].enabled = !settings[guildId].enabled;
        saveSettings(settings);
        
        message.reply(`Привітання ${settings[guildId].enabled ? 'увімкнено' : 'вимкнено'}`);
        break;
        
      case 'info':
        const infoEmbed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('Налаштування привітань')
          .addFields(
            { name: 'Статус', value: settings[guildId].enabled ? 'Увімкнено' : 'Вимкнено', inline: true },
            { name: 'Канал', value: settings[guildId].channelId ? `<#${settings[guildId].channelId}>` : 'Не встановлено', inline: true },
            { name: 'Повідомлення', value: settings[guildId].message }
          )
          .setTimestamp();
          
        message.channel.send({ embeds: [infoEmbed] });
        break;
        
      default:
        message.reply('Невідома опція! Використовуйте: channel, message, test, toggle, info.');
    }
  }
};

// Додаємо обробник подій для нових користувачів
module.exports.events = {
  guildMemberAdd: async (member) => {
    const settings = loadSettings();
    const guildId = member.guild.id;
    
    if (!settings[guildId] || !settings[guildId].enabled || !settings[guildId].channelId) {
      return;
    }
    
    const channel = member.guild.channels.cache.get(settings[guildId].channelId);
    if (!channel) return;
    
    const welcomeMessage = settings[guildId].message
      .replace('{user}', `<@${member.user.id}>`)
      .replace('{server}', member.guild.name)
      .replace('{count}', member.guild.memberCount.toString());
      
    const welcomeEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🎉 Новий учасник!')
      .setDescription(welcomeMessage)
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp();
      
    await channel.send({ embeds: [welcomeEmbed] });
  }
};