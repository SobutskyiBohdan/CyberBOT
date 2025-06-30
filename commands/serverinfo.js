// commands/serverinfo.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Відображення інформації про сервер'),
  
  async execute(interaction) {
    const guild = interaction.guild;
    
    // Get bot count & human count
    const members = await guild.members.fetch();
    const botCount = members.filter(member => member.user.bot).size;
    const humanCount = guild.memberCount - botCount;
    
    // Get channel counts
    const channels = guild.channels.cache;
    const textChannels = channels.filter(channel => channel.type === 0).size;
    const voiceChannels = channels.filter(channel => channel.type === 2).size;
    const categoryChannels = channels.filter(channel => channel.type === 4).size;
    
    // Get role count (excluding @everyone)
    const roleCount = guild.roles.cache.size - 1;
    
    // Create an embed with server info
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
      .addFields(
        { name: 'ID', value: guild.id, inline: true },
        { name: 'Власник', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'Створено', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
        { name: 'Учасники', value: `👥 Всього: ${guild.memberCount}\n👤 Користувачі: ${humanCount}\n🤖 Боти: ${botCount}`, inline: true },
        { name: 'Канали', value: `💬 Текстові: ${textChannels}\n🔊 Голосові: ${voiceChannels}\n📁 Категорії: ${categoryChannels}`, inline: true },
        { name: 'Ролі', value: `${roleCount}`, inline: true },
        { name: 'Рівень підсилення', value: `Рівень ${guild.premiumTier} (${guild.premiumSubscriptionCount} підсилень)`, inline: true }
      )
      .setFooter({ text: `Запитано: ${interaction.user.tag}` })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};