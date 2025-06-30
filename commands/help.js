const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Показує всі доступні команди')
    .addStringOption(option => 
      option.setName('команда')
        .setDescription('Назва команди для детальної інформації')
        .setRequired(false)),
  
  async execute(interaction) {
    const client = interaction.client;
    const prefix = '/'; // Для слеш-команд використовуємо "/"
    const commandName = interaction.options.getString('команда');
    
    if (commandName) {
      // Пошук команди за назвою
      const command = client.commands.get(commandName);
      
      if (command) {
        const commandEmbed = new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle(`Команда: ${prefix}${command.data.name}`)
          .addFields(
            { name: 'Опис', value: command.data.description || 'Опис відсутній' },
            { name: 'Використання', value: `${prefix}${command.data.name}` },
            { name: 'Необхідні дозволи', value: command.data.default_member_permissions ? 'Тільки для модераторів' : 'Відсутні' }
          )
          .setFooter({ text: 'Синтаксис: <> = обов\'язковий, [] = необов\'язковий' })
          .setTimestamp();
        
        return interaction.reply({ embeds: [commandEmbed] });
      } else {
        return interaction.reply({ content: `Команду "${commandName}" не знайдено.`, ephemeral: true });
      }
    }
    
    // Якщо команду не вказано, показуємо всі команди
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('Команди бота')
      .setDescription(`Ось всі доступні команди.\nПрефікс: \`${prefix}\``)
      .addFields(
        {
          name: '👮 Команди модерації',
          value: `
\`${prefix}kick <користувач> [причина]\` - Вигнати користувача
\`${prefix}ban <користувач> [причина]\` - Заблокувати користувача
\`${prefix}unban <userId>\` - Розблокувати користувача
\`${prefix}warn <користувач> [причина]\` - Попередити користувача
\`${prefix}warnings <користувач>\` - Показати попередження користувача
\`${prefix}unwarn <користувач> <warn_id>\` - Видалити попередження користувача
\`${prefix}clear <кількість>\` - Очистити повідомлення
\`${prefix}mute <користувач> [час] [причина]\` - Заглушити користувача
\`${prefix}unmute <користувач>\` - Зняти заглушення з користувача
\`${prefix}role <користувач> <роль> [додати/видалити]\` - Додати або видалити роль
\`${prefix}nickname <користувач> [новий_нікнейм]\` - Змінити нікнейм користувача
\`${prefix}lockdown\` - Заблокувати поточний канал
\`${prefix}unlock\` - Розблокувати поточний канал
          `
        },
        {
          name: '🎵 Музичні команди',
          value: `
\`${prefix}play <назва пісні/URL>\` - Відтворити пісню
\`${prefix}skip\` - Пропустити поточну пісню
\`${prefix}stop\` - Зупинити відтворення та очистити чергу
\`${prefix}pause\` - Призупинити поточну пісню
\`${prefix}resume\` - Відновити відтворення поточної пісні
\`${prefix}queue\` - Показати чергу пісень
\`${prefix}shuffle\` - Перемішати чергу
\`${prefix}volume <1-100>\` - Встановити гучність
\`${prefix}loop\` - Увімкнути/вимкнути режим повтору
\`${prefix}lyrics [назва пісні]\` - Показати текст поточної або вказаної пісні
\`${prefix}playlist <url>\` - Завантажити плейлист з YouTube
\`${prefix}search <назва пісні>\` - Шукати пісні на YouTube
\`${prefix}seek <позиція>\` - Перейти до позиції в поточній пісні
          `
        },
        {
          name: '🎮 Розважальні та утилітні команди',
          value: `
\`${prefix}poll <питання> | [варіант1] | [варіант2] | ...\` - Створити опитування
\`${prefix}giveaway start <час> <переможці> <приз>\` - Почати розіграш
\`${prefix}giveaway end <message_id>\` - Завершити розіграш
\`${prefix}giveaway reroll <message_id> [переможці]\` - Перевизначити переможців розіграшу
\`${prefix}giveaway list\` - Список активних розіграшів
\`${prefix}weather <місцезнаходження>\` - Показати інформацію про погоду
\`${prefix}urban <слово>\` - Пошук в Urban Dictionary
\`${prefix}translate <текст> [мова]\` - Перекласти текст
\`${prefix}reminder <час> <повідомлення>\` - Встановити нагадування
\`${prefix}afk [причина]\` - Позначити себе як AFK
          `
        },
        {
          name: '🛠️ Управління сервером',
          value: `
\`${prefix}welcome channel <канал>\` - Встановити канал привітань
\`${prefix}welcome message <повідомлення>\` - Встановити повідомлення привітання
\`${prefix}welcome toggle\` - Увімкнути/вимкнути повідомлення привітання
\`${prefix}welcome test\` - Перевірити повідомлення привітання
\`${prefix}welcome info\` - Показати налаштування привітань
\`${prefix}autorole <роль>\` - Встановити автоматичну роль для нових учасників
\`${prefix}ping\` - Перевірити затримку бота
\`${prefix}about\` - Показати інформацію про бота
\`${prefix}userinfo <користувач>\` - Показати інформацію про користувача
\`${prefix}serverinfo\` - Показати інформацію про сервер
          `
        }
      )
      .setFooter({ text: 'Використовуйте /help команда для детальнішої інформації про конкретну команду' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};