// commands/poll.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Створює голосування з реакціями')
    .addStringOption(option => 
      option.setName('запитання')
        .setDescription('Запитання для голосування')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('варіанти')
        .setDescription('Варіанти відповідей, розділені символом | (необов\'язково)')
        .setRequired(false)),
  
  async execute(interaction) {
    // Перевіряємо, чи має користувач права на створення голосувань
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages) && 
        !interaction.member.roles.cache.some(r => r.name === 'Poll Creator')) {
      return interaction.reply({
        content: 'У вас немає прав на створення голосувань!',
        ephemeral: true
      });
    }
    
    const pollTitle = interaction.options.getString('запитання');
    const optionsString = interaction.options.getString('варіанти');
    let options = [];
    
    if (optionsString) {
      options = optionsString.split('|').map(option => option.trim()).filter(option => option);
    }
    
    if (options.length > 10) {
      return interaction.reply({
        content: 'Максимальна кількість варіантів - 10!',
        ephemeral: true
      });
    }
    
    try {
      // Створюємо ембед для голосування
      const pollEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('📊 Голосування')
        .setDescription(pollTitle)
        .setFooter({ 
          text: `Голосування створено ${interaction.user.tag}`, 
          iconURL: interaction.user.displayAvatarURL() 
        })
        .setTimestamp();
      
      // Відповідаємо на слеш-команду, щоб вона не протермінувалась
      await interaction.deferReply({ ephemeral: true });
      
      // Якщо є варіанти, додаємо їх до ембеду
      if (options.length > 0) {
        // Емодзі для варіантів (максимум 10)
        const reactions = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        
        for (let i = 0; i < options.length; i++) {
          pollEmbed.addFields({ name: `${reactions[i]} ${options[i]}`, value: '\u200B', inline: false });
        }
        
        const pollMessage = await interaction.channel.send({ embeds: [pollEmbed] });
        
        // Додаємо реакції до повідомлення
        for (let i = 0; i < options.length; i++) {
          await pollMessage.react(reactions[i]);
        }
        
        await interaction.editReply({ content: 'Голосування створено успішно!', ephemeral: true });
      } else {
        // Якщо варіантів немає, це просте голосування так/ні
        const pollMessage = await interaction.channel.send({ embeds: [pollEmbed] });
        
        // Додаємо реакції 👍 і 👎
        await pollMessage.react('👍');
        await pollMessage.react('👎');
        
        await interaction.editReply({ content: 'Голосування створено успішно!', ephemeral: true });
      }
    } catch (error) {
      console.error(error);
      interaction.editReply({
        content: 'Виникла помилка при створенні голосування!',
        ephemeral: true
      });
    }
  }
};