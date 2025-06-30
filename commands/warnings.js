// commands/warnings.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'warnings',
  description: '📋 Show warnings for a user',
  modOnly: true,
  async execute(message, args) {
    if (!args[0]) return message.reply('⚠️ Please specify a user to check warnings for!');
    
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
      
      const warningsEmbed = new EmbedBuilder()
        .setColor('#3498DB')
        .setTitle(`📋 Warnings for ${member.user.tag}`)
        .setDescription(`🔢 Total warnings: ${userWarnings.length}`)
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp();
      
      // Add each warning as a field (up to 25 due to Discord embed limits)
      const maxWarningsToShow = Math.min(userWarnings.length, 25);
      
      for (let i = 0; i < maxWarningsToShow; i++) {
        const warning = userWarnings[i];
        const moderator = await message.guild.members.fetch(warning.moderator)
          .then(mod => mod.user.tag)
          .catch(() => 'Unknown Moderator');
          
        const date = new Date(warning.timestamp).toLocaleDateString();
        
        warningsEmbed.addFields({
          name: `⚠️ Warning ${i + 1}`,
          value: `📝 **Reason:** ${warning.reason}\n🛡️ **Moderator:** ${moderator}\n📅 **Date:** ${date}`
        });
      }
      
      if (userWarnings.length > 25) {
        warningsEmbed.setFooter({ 
          text: `📄 Showing 25/${userWarnings.length} warnings. Use more specific commands to view others.` 
        });
      }
      
      message.channel.send({ embeds: [warningsEmbed] });
    } catch (error) {
      console.error(error);
      message.reply('❌ There was an error trying to fetch the warnings!');
    }
  }
};