// Discord Bot with Moderation and Music Features
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection, REST, Routes } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const fs = require('fs');
const path = require('path');
// Add this near the top of your index.js file
const { createAudioPlayer, createAudioResource, joinVoiceChannel } = require('@discordjs/voice');
require('dotenv').config();

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration
  ],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.User]
});

// Create a DisTube client for music functionality with proper Spotify configuration
const distube = new DisTube(client, {
  // Using only compatible options for the latest version
  emitNewSongOnly: true,
  plugins: [
    new SpotifyPlugin({
      api: {
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      }
    }),
    new SoundCloudPlugin(),
    new YtDlpPlugin()
  ]
});

// Configuration
const config = {
  prefix: '!',
  moderationRoles: ['Owner', 'Administrator', 'Staff', 'Moderator'],
  welcomeChannelId: process.env.WELCOME_CHANNEL_ID || '',
  logChannelId: process.env.LOG_CHANNEL_ID || ''
};

// Collections for command handling
client.commands = new Collection();
client.slashCommands = new Collection();
const commandsPath = path.join(__dirname, 'commands');

// Create commands directory if it doesn't exist
if (!fs.existsSync(commandsPath)) {
  fs.mkdirSync(commandsPath, { recursive: true });
}

// Load legacy commands
try {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && !file.startsWith('slash-'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if (command.name) {
      client.commands.set(command.name, command);
    }
  }
  console.log(`Loaded ${client.commands.size} legacy commands`);
} catch (error) {
  console.log('No legacy command files found or error loading commands:', error.message);
}

// Load slash commands
const slashCommands = [];
try {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    // If the command has a 'data' property, it's a slash command
    if (command.data) {
      client.slashCommands.set(command.data.name, command);
      slashCommands.push(command.data.toJSON());
    }
  }
  console.log(`Loaded ${client.slashCommands.size} slash commands`);
} catch (error) {
  console.log('No slash command files found or error loading slash commands:', error.message);
}

// Register slash commands when bot is ready
client.once('ready', async () => {
  console.log(`Bot is online! Logged in as ${client.user.tag}`);
  client.user.setActivity('Moderating with ❤️');
  
  try {
    console.log('Started refreshing application (/) commands.');
    
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: slashCommands },
    );
    
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error refreshing slash commands:', error);
  }
});

// Welcome message for new members
client.on('guildMemberAdd', async (member) => {
  if (!config.welcomeChannelId) return;
  
  const welcomeChannel = member.guild.channels.cache.get(config.welcomeChannelId);
  if (!welcomeChannel) return;

  const welcomeEmbed = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle(`Welcome to ${member.guild.name}!`)
    .setDescription(`Hey ${member}, welcome to our community! Please read the rules and enjoy your stay!`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: `Member #${member.guild.memberCount}` })
    .setTimestamp();

  welcomeChannel.send({ embeds: [welcomeEmbed] });
});

// Message event handler for legacy commands
client.on('messageCreate', async (message) => {
  // Ignore messages from bots or messages without the prefix
  if (message.author.bot || !message.content.startsWith(config.prefix)) return;

  // Split the message content into arguments
  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Check if the command exists
  const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
  if (!command) return;

  // Check if the command requires moderator permissions
  if (command.modOnly && !message.member.roles.cache.some(role => config.moderationRoles.includes(role.name))) {
    return message.reply('Ви не маєте дозволу на використання цієї команди.');
  }

  try {
    // Execute the command
    await command.execute(message, args, client, distube);
  } catch (error) {
    console.error(error);
    message.reply('Сталася помилка при виконанні цієї команди!');
  }
});

// Handle slash command interactions
client.on('interactionCreate', async (interaction) => {
  // Handle slash commands
  if (interaction.isChatInputCommand()) {
    const command = client.slashCommands.get(interaction.commandName);
    
    if (!command) return;
    
    // Check if the command requires moderator permissions
    if (command.modOnly && !interaction.member.roles.cache.some(role => config.moderationRoles.includes(role.name))) {
      return interaction.reply({ content: 'Ви не маєте дозволу на використання цієї команди.', ephemeral: true });
    }
    
    try {
      await command.execute(interaction, client, distube);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Сталася помилка при виконанні цієї команди!', ephemeral: true });
    }
    return;
  }
  
  // Handle button interactions for music controls
  if (interaction.isButton()) {
    const queue = distube.getQueue(interaction.guildId);
    if (!queue) return;

    try {
      switch (interaction.customId) {
        case 'pause':
          if (queue.paused) {
            queue.resume();
            await interaction.reply({ content: '▶️ Музика відновлена!', ephemeral: true });
          } else {
            queue.pause();
            await interaction.reply({ content: '⏸️ Музика призупинена!', ephemeral: true });
          }
          break;
        case 'skip':
          try {
            if (queue.songs.length <= 1) {
              queue.stop();
              await interaction.reply({ content: '⏭️ Пропущено останню пісню та зупинено відтворення!', ephemeral: true });
            } else {
              queue.skip();
              await interaction.reply({ content: '⏭️ Пісня пропущена!', ephemeral: true });
            }
          } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Помилка під час пропуску: ' + error.message, ephemeral: true });
          }
          break;
        case 'stop':
          queue.stop();
          await interaction.reply({ content: '⏹️ Музика зупинена!', ephemeral: true });
          break;
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Сталася помилка під час обробки вашого запиту.', ephemeral: true });
    }
  }
});

// Music event handlers
distube
  .on('playSong', (queue, song) => {
    // Create a beautiful embed for the currently playing song
    const playEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎵 Зараз відтворюється')
      .setDescription(`[${song.name}](${song.url})`)
      .addFields(
        { name: 'Тривалість', value: `\`${song.formattedDuration}\``, inline: true },
        { name: 'Запитав', value: `${song.user}`, inline: true },
        { name: 'Джерело', value: song.source, inline: true }
      )
      .setThumbnail(song.thumbnail)
      .setFooter({ text: `Гучність: ${queue.volume}% | Довжина черги: ${queue.songs.length} пісень` });

    // Create control buttons
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('pause')
          .setLabel('⏯️ Пауза/Продовжити')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('skip')
          .setLabel('⏭️ Пропустити')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('stop')
          .setLabel('⏹️ Зупинити')
          .setStyle(ButtonStyle.Danger)
      );

    queue.textChannel.send({ embeds: [playEmbed], components: [row] });
  })
  .on('addSong', (queue, song) => {
    queue.textChannel.send(`✅ Додано **${song.name}** - \`${song.formattedDuration}\` до черги`);
  })
  .on('addList', (queue, playlist) => {
    queue.textChannel.send(`✅ Додано плейлист \`${playlist.name}\` (${playlist.songs.length} пісень) до черги`);
  })
  .on('error', (channel, error) => {
    // Fix the channel.send error by checking if channel is a valid Discord channel object
    console.error('DisTube error:', error);
    
    // Check if channel exists and has a send method before attempting to use it
    if (channel && typeof channel.send === 'function') {
      channel.send(`⛔ Сталася помилка: ${error.toString().slice(0, 1974)}`);
    }
  })
  .on('empty', (queue) => {
    queue.textChannel.send('⚠️ Голосовий канал порожній! Покидаю канал...');
  })
  .on('finish', (queue) => {
    queue.textChannel.send('🏁 Черга закінчилась! Більше немає пісень для відтворення.');
  });

// Login to Discord
client.login(process.env.DISCORD_TOKEN);

const http = require('http');

// Створюємо простий HTTP-сервер
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Discord Bot is running!');
});

// Використовуємо порт з змінної середовища PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});