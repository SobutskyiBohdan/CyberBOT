// commands/nickname.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nickname')
    .setDescription('Змінює нікнейм користувача')
    .addUserOption(option => 
      option.setName('користувач')
        .setDescription('Користувач, якому потрібно змінити нікнейм')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('новий_нікнейм')
        .setDescription('Новий нікнейм (залиште порожнім, щоб скинути)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),
  
  async execute(interaction) {
    const member = interaction.options.getMember('користувач');
    const newNickname = interaction.options.getString('новий_нікнейм');
    
    if (!member) {
      return interaction.reply({
        content: 'Не вдалося знайти цього користувача!',
        ephemeral: true
      });
    }
    
    if (!member.manageable) {
      return interaction.reply({
        content: 'Я не можу змінити нікнейм цього користувача!',
        ephemeral: true
      });
    }
    
    const oldNickname = member.nickname || member.user.username;
    
    try {
      await member.setNickname(newNickname || null);
      
      const nickEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Зміна нікнейму')
        .addFields(
          { name: 'Користувач', value: member.user.tag, inline: true },
          { name: 'Модератор', value: interaction.user.tag, inline: true },
          { name: 'Старий нікнейм', value: oldNickname, inline: true },
          { name: 'Новий нікнейм', value: newNickname ? newNickname : 'Скинуто до нікнейму за замовчуванням', inline: true }
        )
        .setTimestamp();
      
      await interaction.reply({ embeds: [nickEmbed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Виникла помилка при спробі змінити нікнейм цього користувача!',
        ephemeral: true
      });
    }
  }
};