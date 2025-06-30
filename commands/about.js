const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('Показує інформацію про бота'),
  
  async execute(interaction) {
    // Налаштуйте ці значення відповідно до вашого бота
    const botName = 'Moderator Bot';
    const version = '1.0.0';
    const owner = 'Sobutskyi';
    const createdAt = '01.03.2025';
    const prefix = '/'; // Для слеш-команд використовуємо "/"
    const supportServer = 'https://discord.gg/tW5CzxMt9R';
    
    try {
      const aboutEmbed = new EmbedBuilder()
        .setColor('#00AAFF')
        .setTitle(`Про ${botName}`)
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .addFields(
          { name: '📝 Назва', value: botName, inline: true },
          { name: '🔄 Версія', value: version, inline: true },
          { name: '👑 Власник', value: owner, inline: true },
          { name: '📅 Створено', value: createdAt, inline: true },
          { name: '⚙️ Префікс', value: prefix, inline: true },
          { name: '🌐 Сервер підтримки', value: supportServer, inline: false },
          { name: '📊 Статистика', value: 
            `Серверів: ${interaction.client.guilds.cache.size}\n` +
            `Користувачів: ${interaction.client.users.cache.size}\n` +
            `Час роботи: ${Math.round(interaction.client.uptime / 86400000)} днів`
          }
        )
        .setFooter({ text: `Запитано ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp();
      
      await interaction.reply({ embeds: [aboutEmbed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({ 
        content: 'Сталася помилка при отриманні інформації про бота!', 
        ephemeral: true 
      });
    }
  }
};