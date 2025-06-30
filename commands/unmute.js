// commands/unmute.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'unmute',
  description: 'Знімає обмеження на написання повідомлень з користувача',
  modOnly: true,
  async execute(message, args) {
    if (!args[0]) return message.reply('Будь ласка, вкажіть користувача для зняття мьюту!');
    
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) return message.reply('Не вдалося знайти цього користувача!');
    
    const muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
    if (!muteRole) return message.reply('На цьому сервері немає ролі "Muted"!');
    
    if (!member.roles.cache.has(muteRole.id)) return message.reply('Цей користувач не заглушений!');
    
    try {
      await member.roles.remove(muteRole);
      
      const unmuteEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Користувач розглушений')
        .addFields(
          { name: 'Користувач', value: member.user.tag, inline: true },
          { name: 'Модератор', value: message.author.tag, inline: true },
        )
        .setTimestamp();
      
      message.channel.send({ embeds: [unmuteEmbed] });
    } catch (error) {
      console.error(error);
      message.reply('Виникла помилка при спробі розглушити цього користувача!');
    }
  }
};