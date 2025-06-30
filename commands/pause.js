// commands/pause.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Призупинити поточну пісню'),
  
  async execute(interaction, client) {
    // Отримуємо DisTube з client
    const distube = client.distube;
    
    const queue = distube.getQueue(interaction.guildId);
    if (!queue) return interaction.reply('Зараз нічого не відтворюється!');
    
    if (queue.paused) return interaction.reply('Музика вже призупинена!');
    
    try {
      queue.pause();
      await interaction.reply('⏸️ Музику призупинено!');
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Виникла помилка при спробі призупинити музику.',
        ephemeral: true
      });
    }
  }
};