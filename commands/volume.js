// commands/volume.js
module.exports = {
  name: 'volume',
  description: 'Change the volume of the music',
  aliases: ['vol'],
  async execute(message, args, client, distube) {
    const queue = distube.getQueue(message);
    if (!queue) return message.reply('There is nothing playing!');
    
    const volume = parseInt(args[0]);
    if (isNaN(volume)) return message.reply(`Current volume: **${queue.volume}%**`);
    
    if (volume < 1 || volume > 100) 
      return message.reply('Please provide a number between 1 and 100!');
    
    try {
      queue.setVolume(volume);
      message.channel.send(`🔊 Volume set to **${volume}%**`);
    } catch (error) {
      console.error(error);
      message.reply('An error occurred while trying to change the volume.');
    }
  }
};