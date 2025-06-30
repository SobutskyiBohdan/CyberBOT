// commands/skip.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Пропустити поточну пісню'),
  
  async execute(interaction, client, distube) {
    const queue = distube.getQueue(interaction.guildId);
    if (!queue) return interaction.reply('Зараз нічого не відтворюється!');
    
    try {
      const song = queue.songs[0];
      
      // Check if there are songs after the current one
      if (queue.songs.length <= 1) {
        // If this is the last song, stop playback instead of skipping
        await distube.stop(interaction.guild);
        return interaction.reply(`⏭️ Пропущено **${song.name}** і відтворення зупинено, оскільки в черзі більше немає пісень.`);
      } else {
        // Otherwise skip to next song
        await queue.skip();
        return interaction.reply(`⏭️ Пропущено **${song.name}**`);
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Виникла помилка при спробі пропустити пісню.',
        ephemeral: true
      });
    }
  }
};