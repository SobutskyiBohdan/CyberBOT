// commands/warn.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'warn',
  description: '⚠️ Warn a user in the server',
  modOnly: true,
  async execute(message, args) {
    if (!args[0]) return message.reply('⚠️ Please specify a user to warn!');
    
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) return message.reply('❓ Could not find that member!');
    
    const reason = args.slice(1).join(' ') || 'No reason provided';
    
    try {
      // Get or create warnings collection in the database
      if (!message.client.warnings) {
        message.client.warnings = new Map();
      }
      
      // Get user warnings or create new array
      const userWarnings = message.client.warnings.get(member.id) || [];
      
      // Add new warning with details
      userWarnings.push({
        moderator: message.author.id,
        reason: reason,
        timestamp: Date.now(),
        guild: message.guild.id
      });
      
      // Save updated warnings
      message.client.warnings.set(member.id, userWarnings);
      
      const warnEmbed = new EmbedBuilder()
        .setColor('#FFCC00')
        .setTitle('⚠️ User Warned')
        .addFields(
          { name: '👤 User', value: member.user.tag, inline: true },
          { name: '🛡️ Moderator', value: message.author.tag, inline: true },
          { name: '📝 Reason', value: reason },
          { name: '🔢 Warning Count', value: `${userWarnings.length}`, inline: true }
        )
        .setTimestamp();
      
      message.channel.send({ embeds: [warnEmbed] });
      
      // Notify the user they've been warned
      try {
        await member.send({ 
          content: `⚠️ You have been warned in ${message.guild.name} by ${message.author.tag}.\n📝 Reason: ${reason}` 
        });
      } catch (err) {
        message.channel.send('✉️ Warning logged, but I could not DM the user.');
      }
    } catch (error) {
      console.error(error);
      message.reply('❌ There was an error trying to warn this user!');
    }
  }
};