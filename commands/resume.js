// commands/resume.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Відновити відтворення поточної пісні'),
  
  async execute(interaction, client, distube) {
    const queue = distube.getQueue(interaction.guildId);
    if (!queue) return interaction.reply('Зараз нічого не відтворюється!');
    
    if (!queue.paused) return interaction.reply('Музика вже відтворюється!');
    
    try {
      queue.resume();
      await interaction.reply('▶️ Відтворення музики відновлено!');
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Виникла помилка при спробі відновити відтворення музики.',
        ephemeral: true
      });
    }
  }
};