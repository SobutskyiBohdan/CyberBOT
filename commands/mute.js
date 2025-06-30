// commands/mute.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Тимчасово забороняє користувачу писати повідомлення')
    .addUserOption(option => 
      option.setName('користувач')
        .setDescription('Користувач, якого потрібно заглушити')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('час')
        .setDescription('Тривалість мʼюту (наприклад: 1h, 30m, 1d)')
        .setRequired(false))
    .addStringOption(option => 
      option.setName('причина')
        .setDescription('Причина мʼюту')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  
  async execute(interaction) {
    const member = interaction.options.getMember('користувач');
    let time = interaction.options.getString('час') || '1h';
    const reason = interaction.options.getString('причина') || 'Причина не вказана';
    
    if (!member) {
      return interaction.reply({
        content: 'Не вдалося знайти цього користувача!',
        ephemeral: true
      });
    }
    
    if (!member.manageable) {
      return interaction.reply({
        content: 'Я не можу заборонити писати цьому користувачу!',
        ephemeral: true
      });
    }
    
    try {
      // Шукаємо роль "Muted" або створюємо її
      let muteRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');
      if (!muteRole) {
        muteRole = await interaction.guild.roles.create({
          name: 'Muted',
          color: '#808080',
          reason: 'Для мьютів користувачів'
        });
        
        // Налаштовуємо дозволи для всіх текстових каналів
        interaction.guild.channels.cache.forEach(async channel => {
          await channel.permissionOverwrites.create(muteRole, {
            SendMessages: false,
            AddReactions: false
          });
        });
      }
      
      // Додаємо роль користувачу
      await member.roles.add(muteRole);
      
      // Створюємо ембед з інформацією
      const muteEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('Користувач заглушений')
        .addFields(
          { name: 'Користувач', value: member.user.tag, inline: true },
          { name: 'Модератор', value: interaction.user.tag, inline: true },
          { name: 'Тривалість', value: time, inline: true },
          { name: 'Причина', value: reason }
        )
        .setTimestamp();
      
      await interaction.reply({ embeds: [muteEmbed] });
      
      // Видаляємо роль після закінчення часу
      setTimeout(async () => {
        if (member.roles.cache.has(muteRole.id)) {
          await member.roles.remove(muteRole);
          await interaction.channel.send(`${member.user.tag} більше не заглушений!`);
        }
      }, ms(time));
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Виникла помилка при спробі заглушити цього користувача!',
        ephemeral: true
      });
    }
  }
};