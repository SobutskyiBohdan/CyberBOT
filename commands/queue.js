// commands/queue.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Відображення поточної черги пісень'),
  
  async execute(interaction, client, distube) {
    const queue = distube.getQueue(interaction.guildId);
    if (!queue) return interaction.reply('Зараз нічого не відтворюється!');
    
    const songs = queue.songs;
    
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📋 Музична черга')
      .setDescription(`**Поточна пісня:** [${songs[0].name}](${songs[0].url}) - \`${songs[0].formattedDuration}\``)
      .setThumbnail(songs[0].thumbnail);
    
    if (songs.length > 1) {
      const queueList = songs.slice(1, 11).map((song, index) => 
        `${index + 1}. [${song.name}](${song.url}) - \`${song.formattedDuration}\``
      ).join('\n');
      
      embed.addFields({ 
        name: 'Наступні', 
        value: queueList || 'Немає пісень у черзі' 
      });
      
      if (songs.length > 11) {
        embed.addFields({ 
          name: 'І ще...', 
          value: `${songs.length - 11} більше пісень у черзі` 
        });
      }
    }
    
    embed.setFooter({ 
      text: `Загальна кількість пісень: ${songs.length} | Загальна тривалість: ${queue.formattedDuration}` 
    });
    
    await interaction.reply({ embeds: [embed] });
  }
};