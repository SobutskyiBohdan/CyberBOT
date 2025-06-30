// commands/unlock.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Розблокувати поточний канал')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  
  async execute(interaction) {
    try {
      // Отримуємо роль @everyone
      const everyoneRole = interaction.guild.roles.everyone;
      
      // Змінюємо права доступу для каналу
      await interaction.channel.permissionOverwrites.edit(everyoneRole, {
        SendMessages: null
      });
      
      const unlockEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Канал розблоковано')
        .addFields(
          { name: 'Канал', value: interaction.channel.name, inline: true },
          { name: 'Модератор', value: interaction.user.tag, inline: true },
          { name: 'Час', value: new Date().toLocaleString(), inline: false }
        )
        .setDescription('Цей канал було розблоковано для відправки повідомлень')
        .setTimestamp();
      
      await interaction.reply({ embeds: [unlockEmbed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Виникла помилка при спробі розблокувати цей канал!',
        ephemeral: true
      });
    }
  }
};