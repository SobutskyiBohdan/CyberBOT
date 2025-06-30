// commands/ban.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Заблокувати користувача на сервері')
    .addUserOption(option => 
      option.setName('учасник')
        .setDescription('Учасник, якого потрібно заблокувати')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('причина')
        .setDescription('Причина блокування')
        .setRequired(true))
    .setDefaultMemberPermissions(0x0000000000000004), // BAN_MEMBERS permission
  
  async execute(interaction) {
    const member = interaction.options.getMember('учасник');
    const reason = interaction.options.getString('причина');
    
    if (!member) {
      return interaction.reply({
        content: 'Не вдалося знайти цього учасника!',
        ephemeral: true
      });
    }
    
    if (!member.bannable) {
      return interaction.reply({
        content: 'Я не можу заблокувати цього користувача!',
        ephemeral: true
      });
    }
    
    try {
      await member.ban({ reason: reason });
      
      const banEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Користувача заблоковано')
        .addFields(
          { name: 'Користувач', value: member.user.tag, inline: true },
          { name: 'Модератор', value: interaction.user.tag, inline: true },
          { name: 'Причина', value: reason }
        )
        .setTimestamp();
      
      await interaction.reply({ embeds: [banEmbed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Виникла помилка при спробі заблокувати цього користувача!',
        ephemeral: true
      });
    }
  }
};