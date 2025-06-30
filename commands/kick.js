// commands/kick.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Вигнати користувача з сервера')
    .addUserOption(option => 
      option.setName('учасник')
        .setDescription('Учасник, якого потрібно вигнати')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('причина')
        .setDescription('Причина вигнання')
        .setRequired(true))
    .setDefaultMemberPermissions(0x0000000000000002), // KICK_MEMBERS permission
  
  async execute(interaction) {
    const member = interaction.options.getMember('учасник');
    const reason = interaction.options.getString('причина');
    
    if (!member) {
      return interaction.reply({
        content: 'Не вдалося знайти цього учасника!',
        ephemeral: true
      });
    }
    
    if (!member.kickable) {
      return interaction.reply({
        content: 'Я не можу вигнати цього користувача!',
        ephemeral: true
      });
    }
    
    try {
      await member.kick(reason);
      
      const kickEmbed = new EmbedBuilder()
        .setColor('#FF4136')
        .setTitle('Користувача вигнано')
        .addFields(
          { name: 'Користувач', value: member.user.tag, inline: true },
          { name: 'Модератор', value: interaction.user.tag, inline: true },
          { name: 'Причина', value: reason }
        )
        .setTimestamp();
      
      await interaction.reply({ embeds: [kickEmbed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Виникла помилка при спробі вигнати цього користувача!',
        ephemeral: true
      });
    }
  }
};