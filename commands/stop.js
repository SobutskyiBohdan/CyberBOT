// commands/stop.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Зупинити відтворення та очистити чергу'),
  
  async execute(interaction, client, distube) {
    const queue = distube.getQueue(interaction.guildId);
    if (!queue) return interaction.reply('Зараз нічого не відтворюється!');
    
    try {
      queue.stop();
      await interaction.reply('⏹️ Музика зупинена та черга очищена!');
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Виникла помилка при спробі зупинити музику.',
        ephemeral: true
      });
    }
  }
};