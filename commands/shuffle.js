// commands/shuffle.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Перемішати чергу пісень'),
  
  async execute(interaction, client, distube) {
    const queue = distube.getQueue(interaction.guildId);
    if (!queue) return interaction.reply('Зараз нічого не відтворюється!');
    
    try {
      queue.shuffle();
      await interaction.reply('🔀 Черга пісень була перемішана!');
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Виникла помилка при спробі перемішати чергу пісень.',
        ephemeral: true
      });
    }
  }
};