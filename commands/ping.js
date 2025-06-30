// commands/ping.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Перевірити затримку бота'),
  
  async execute(interaction) {
    // Відправляємо початкову відповідь
    await interaction.reply('Вимірюємо затримку...');
    
    const sentTimestamp = Date.now();
    
    const pingEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🏓 Понг!')
      .addFields(
        { name: 'Затримка бота', value: `${sentTimestamp - interaction.createdTimestamp}ms`, inline: true },
        { name: 'Затримка API', value: `${Math.round(interaction.client.ws.ping)}ms`, inline: true }
      )
      .setTimestamp();
    
    await interaction.editReply({ content: null, embeds: [pingEmbed] });
  }
};