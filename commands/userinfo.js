// commands/userinfo.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'userinfo',
  description: 'Display information about a user',
  aliases: ['user', 'whois'],
  async execute(message, args) {
    // Get the target user (mentioned user, ID, or message author)
    const target = message.mentions.users.first() || 
                  (args[0] ? await message.client.users.fetch(args[0]).catch(() => message.author) : message.author);
    
    // Get the member object if the user is in the guild
    const member = message.guild.members.cache.get(target.id);
    
    // Create an embed with user info
    const embed = new EmbedBuilder()
      .setColor(member ? member.displayHexColor : '#5865F2')
      .setTitle(`${target.tag}`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 1024 }))
      .addFields(
        { name: 'ID', value: target.id, inline: true },
        { name: 'Nickname', value: member ? member.nickname || 'None' : 'N/A', inline: true },
        { name: 'Bot', value: target.bot ? 'Yes' : 'No', inline: true },
        { name: 'Account Created', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:F>`, inline: true }
      )
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();
    
    // Add guild-specific information if the user is in the guild
    if (member) {
      // Format join date
      const joinTime = Math.floor(member.joinedTimestamp / 1000);
      
      // Get roles (excluding @everyone)
      const roles = member.roles.cache
        .filter(role => role.id !== message.guild.id)
        .sort((a, b) => b.position - a.position)
        .map(role => role.toString())
        .join(', ') || 'None';
      
      embed.addFields(
        { name: 'Joined Server', value: `<t:${joinTime}:F>`, inline: true },
        { name: `Roles [${member.roles.cache.size - 1}]`, value: roles.length > 1024 ? roles.substring(0, 1020) + '...' : roles }
      );
    }
    
    message.channel.send({ embeds: [embed] });
  }
};