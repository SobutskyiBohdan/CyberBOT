// commands/unban.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Розблокувати користувача на сервері')
    .addStringOption(option => 
      option.setName('користувач_id')
        .setDescription('ID користувача, якого потрібно розблокувати')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  
  async execute(interaction) {
    const userId = interaction.options.getString('користувач_id');
    
    try {
      const bans = await interaction.guild.bans.fetch();
      
      if (!bans.some(ban => ban.user.id === userId)) {
        return interaction.reply({
          content: 'Цей користувач не заблокований!',
          ephemeral: true
        });
      }
      
      await interaction.guild.members.unban(userId);
      
      const unbanEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Користувача розблоковано')
        .addFields(
          { name: 'ID користувача', value: userId, inline: true },
          { name: 'Модератор', value: interaction.user.tag, inline: true }
        )
        .setTimestamp();
      
      await interaction.reply({ embeds: [unbanEmbed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Виникла помилка при спробі розблокувати цього користувача!',
        ephemeral: true
      });
    }
  }
};