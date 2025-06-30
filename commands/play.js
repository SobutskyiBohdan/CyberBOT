// commands/play.js
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Відтворити пісню')
    .addStringOption(option => 
      option.setName('url')
        .setDescription('URL або назва пісні для відтворення')
        .setRequired(true)
    ),
  
  async execute(interaction, client, distube) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply('Ви повинні бути в голосовому каналі, щоб відтворювати музику!');
    }
    
    const query = interaction.options.getString('url');
    
    try {
      await interaction.reply(`🔍 Пошук: \`${query}\``);
      
      // Оновлений метод DisTube для останньої версії
      distube.play(voiceChannel, query, {
        member: interaction.member,
        textChannel: interaction.channel
      });
    } catch (error) {
      console.error(error);
      interaction.followUp(`Помилка: ${error.message}`);
    }
  }
};