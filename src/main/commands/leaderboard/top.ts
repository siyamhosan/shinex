import { Command, CommandRun } from 'dtscommands'
import prisma from '../../../prisma.js'
import { BotEmbed } from '../../../utils/Embeds.js'

const Top3Emojis = [
  '<:top1:1158322922298015794>',
  '<:top2:1158322918221152286>',
  '<:top3:1158322913036992634>'
]

export class TopCmd extends Command {
  constructor () {
    super({
      name: 'top',
      description: '',
      category: 'Leaderboard'
    })
  }

  async run ({ message }: CommandRun) {
    let alreadyFound = false
    const embed = new BotEmbed({
      title: 'Top 10 - Vouches Leaderboard',
      description: "You are not in the top 10, so can't see top.",
      color: 0x00ff00
    })

    const messageToReply = await message.channel.send({
      embeds: [embed]
    })

    setTimeout(() => {
      embed.setDescription('Just Kidding :smile:')
      if (!alreadyFound) {
        messageToReply.edit({
          embeds: [embed]
        })
      }
    }, 1500)

    console.time('fetching all users')
    const allUsers = await prisma.profile.findMany()
    console.timeEnd('fetching all users')

    alreadyFound = true

    const top10 = allUsers
      .sort(
        (a, b) =>
          b.positiveVouches +
          b.importedVouches -
          (a.positiveVouches + a.importedVouches)
      )
      .slice(0, 10)

    const top10String = top10
      .map(
        (user, index) =>
          `${
            index + 1 === 1
              ? Top3Emojis[0]
              : index + 1 === 2
              ? Top3Emojis[1]
              : index + 1 === 3
              ? Top3Emojis[2]
              : index + 1
          }| \`user: ${user.username}\` - \`${
            user.positiveVouches + user.importedVouches
          } vouches\``
      )
      .join('\n')

    embed.setDescription(top10String === '' ? 'No users found' : top10String)

    messageToReply.edit({
      embeds: [embed]
    })
  }
}
