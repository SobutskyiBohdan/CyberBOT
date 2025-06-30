// commands/lockdown.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lockdown')
    .setDescription('Заблокувати поточний канал')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  
  async execute(interaction) {
    try {
      // Отримуємо роль @everyone
      const everyoneRole = interaction.guild.roles.everyone;
      
      // Змінюємо права доступу для каналу
      await interaction.channel.permissionOverwrites.edit(everyoneRole, {
        SendMessages: false
      });
      
      const lockdownEmbed = new EmbedBuilder()
        .setColor('#FF9900')
        .setTitle('Канал заблоковано')
        .addFields(
          { name: 'Канал', value: interaction.channel.name, inline: true },
          { name: 'Модератор', value: interaction.user.tag, inline: true },
          { name: 'Час', value: new Date().toLocaleString(), inline: false }
        )
        .setDescription('Цей канал було заблоковано для відправки повідомлень')
        .setTimestamp();
      
      await interaction.reply({ embeds: [lockdownEmbed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({ 
        content: 'Виникла помилка при спробі заблокувати цей канал!',
        ephemeral: true
      });
    }
  }
};