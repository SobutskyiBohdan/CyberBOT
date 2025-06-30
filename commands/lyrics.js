// commands/lyrics.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('Показує текст пісні, яка зараз грає або вказаної пісні')
    .addStringOption(option => 
      option.setName('запит')
        .setDescription('Назва пісні (опціонально: "Артист - Назва пісні")')
        .setRequired(false)),
  
  async execute(interaction, client) {
    await interaction.deferReply();
    
    // Перевіряємо, чи вказано запит або використовуємо поточну пісню
    let songQuery;
    let currentSong = false;
    
    const queryOption = interaction.options.getString('запит');
    
    if (!queryOption) {
      // Отримуємо інформацію про поточну пісню
      const serverQueue = client.queue.get(interaction.guild.id);
      if (!serverQueue || !serverQueue.songs[0]) {
        return interaction.followUp('Зараз нічого не грає! Вкажіть назву пісні в команді.');
      }
      songQuery = serverQueue.songs[0].title;
      currentSong = true;
    } else {
      songQuery = queryOption;
    }

    try {
      // Відправляємо повідомлення про пошук
      await interaction.followUp(`🔍 Шукаю текст пісні для "${songQuery}"...`);

      // Використовуємо API для пошуку текстів пісень (приклад API - потрібно замінити на актуальний)
      const response = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(songQuery.split(' - ')[0])}/${encodeURIComponent(songQuery.split(' - ')[1] || songQuery)}`);
      
      if (!response.ok) {
        await interaction.editReply(`❌ Не вдалося знайти текст пісні для "${songQuery}". Спробуйте вказати артиста та назву пісні через дефіс (наприклад: "Артист - Назва пісні").`);
        return;
      }

      const data = await response.json();
      let lyrics = data.lyrics;

      // Обробляємо випадок, коли текст пісні занадто довгий
      if (lyrics.length > 4000) {
        lyrics = lyrics.substring(0, 3997) + '...';
      }

      // Створюємо ембед з текстом пісні
      const lyricsEmbed = new EmbedBuilder()
        .setColor('#1DB954')
        .setTitle(`📝 Текст пісні: ${songQuery}`)
        .setDescription(lyrics)
        .setFooter({ text: currentSong ? 'Поточна пісня' : 'Запитана пісня', iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp();

      await interaction.editReply({ content: null, embeds: [lyricsEmbed] });
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      interaction.editReply(`❌ Виникла помилка при пошуку тексту пісні: ${error.message}`);
    }
  }
};