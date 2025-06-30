// commands/clear.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Очистити повідомлення з каналу')
    .addIntegerOption(option => 
      option.setName('кількість')
        .setDescription('Кількість повідомлень для видалення')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100))
    .setDefaultMemberPermissions(0x0000000000000008), // MODERATE_MEMBERS permission
  
  async execute(interaction) {
    const amount = interaction.options.getInteger('кількість');
    
    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);
      await interaction.reply({ 
        content: `✅ Видалено ${deleted.size} повідомлень!`,
        ephemeral: true
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({ 
        content: 'Виникла помилка при видаленні повідомлень! Повідомлення старіші за 14 днів не можуть бути масово видалені.',
        ephemeral: true
      });
    }
  }
};