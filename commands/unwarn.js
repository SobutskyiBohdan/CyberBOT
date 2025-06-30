// commands/unwarn.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'unwarn',
  description: '🔄 Remove a warning from a user',
  modOnly: true,
  async execute(message, args) {
    if (!args[0]) return message.reply('⚠️ Please specify a user to remove a warning from!');
    
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) return message.reply('❓ Could not find that member!');
    
    try {
      // Check if warnings collection exists
      if (!message.client.warnings) {
        message.client.warnings = new Map();
      }
      
      // Get user warnings
      const userWarnings = message.client.warnings.get(member.id) || [];
      
      // Check if user has warnings
      if (userWarnings.length === 0) {
        return message.reply(`✅ ${member.user.tag} has no warnings.`);
      }
      
      const warnIndex = args[1] ? parseInt(args[1]) - 1 : userWarnings.length - 1;
      
      // Validate index
      if (isNaN(warnIndex) || warnIndex < 0 || warnIndex >= userWarnings.length) {
        return message.reply(`❌ Please provide a valid warning number between 1 and ${userWarnings.length}.`);
      }
      
      // Get the removed warning info
      const removedWarning = userWarnings[warnIndex];
      
      // Remove the warning at the specified index
      userWarnings.splice(warnIndex, 1);
      
      // Update the warnings collection
      message.client.warnings.set(member.id, userWarnings);
      
      const unwarnEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🔄 Warning Removed')
        .addFields(
          { name: '👤 User', value: member.user.tag, inline: true },
          { name: '🛡️ Moderator', value: message.author.tag, inline: true },
          { name: '📝 Removed Warning', value: removedWarning.reason },
          { name: '🔢 Remaining Warnings', value: `${userWarnings.length}`, inline: true }
        )
        .setTimestamp();
      
      message.channel.send({ embeds: [unwarnEmbed] });
    } catch (error) {
      console.error(error);
      message.reply('❌ There was an error trying to remove the warning!');
    }
  }
};