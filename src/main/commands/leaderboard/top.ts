import { Command, CommandRun } from 'dtscommands'
import { BotEmbed } from '../../../utils/Embeds.js'
import vouchClient from '../../../vouchClient.js'

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
    const embed = new BotEmbed({
      title: 'Top 10 Users | Shinex Leaderboard',
      color: 0x00ff00
    })

    const messageToReply = await message.channel.send({
      embeds: [embed]
    })

    const top10 = await vouchClient.leaderboard.top10()

    if (!top10?.length) {
      embed.setDescription('No users found.')
      return messageToReply.edit({
        embeds: [embed]
      })
    }

    const formatted = top10.map((user, index) => {
      return `${
        Top3Emojis[index] || `  **${index + 1}**  `
      }| User: ${user.username.replace(/_/, '\\_')} - **${
        user.importedVouches + user.positiveVouches
      }** vouches`
    })

    embed.setDescription(formatted.join('\n'))

    messageToReply.edit({
      embeds: [embed]
    })
  }
}
