// commands/loop.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Перемикання режиму повторення')
    .addStringOption(option =>
      option.setName('режим')
        .setDescription('Режим повторення')
        .setRequired(false)
        .addChoices(
          { name: 'вимкнено', value: 'off' },
          { name: 'пісня', value: 'song' },
          { name: 'черга', value: 'queue' }
        )),
  
  async execute(interaction, client) {
    // Отримуємо DisTube з client
    const distube = client.distube;
    
    const queue = distube.getQueue(interaction.guildId);
    if (!queue) return interaction.reply('Зараз нічого не відтворюється!');
    
    let mode = 0;
    const option = interaction.options.getString('режим');
    
    if (option) {
      switch (option) {
        case 'off':
          mode = 0;
          break;
        case 'song':
          mode = 1;
          break;
        case 'queue':
          mode = 2;
          break;
      }
    } else {
      // Циклічне переключення режимів, якщо аргумент не вказано
      mode = (queue.repeatMode + 1) % 3;
    }
    
    const modeMap = {
      0: 'Вимкнено',
      1: 'Пісня',
      2: 'Черга'
    };
    
    try {
      queue.setRepeatMode(mode);
      await interaction.reply(`🔄 Режим повторення встановлено на: **${modeMap[mode]}**`);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Виникла помилка при спробі змінити режим повторення.',
        ephemeral: true
      });
    }
  }
};