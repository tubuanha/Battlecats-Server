const { inspect } = require('util')
const { MessageEmbed } = require('discord.js')

module.exports = {
  name: 'eval',
  async execute(message, args) {
    if (message.author.id !== '723052392911863858') return

    try {
      // eslint-disable-next-line no-eval
      const evaled = await eval(args.join(' '))
      message
        .reply({
          embeds: [
            new MessageEmbed()
              .setTitle('出力')
              .setDescription(`\`\`\`js\n${inspect(evaled)}\n\`\`\``)
              .setColor('BLURPLE'),
          ],
        })
        .catch((e) => {
          console.log(inspect(evaled))
          message.reply('コンソールへ出力しました。')
        })
    } catch (e) {
      message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle('エラー')
            .setDescription(`\`\`\`js\n${e}\n\`\`\``)
            .setColor('RED'),
        ],
      })
    }
  },
}
