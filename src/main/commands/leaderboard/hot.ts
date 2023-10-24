import { Command, CommandRun } from 'dtscommands'
import { BotEmbed } from '../../../utils/Embeds.js'
import vouchClient from '../../../vouchClient.js'

export class LeaderBoardHot extends Command {
  constructor () {
    super({
      name: 'hot',
      description: 'Hot Users of the week',
      category: 'Leaderboard'
    })
  }

  async run ({ message }: CommandRun) {
    const embed = new BotEmbed({
      title: 'Hot Users of this week | Shinex Leaderboard',
      color: 0x00ff00
    })

    const messageToReply = await message.channel.send({
      embeds: [embed]
    })

    const top10 = await vouchClient.leaderboard.hot10()

    if (!top10?.length) {
      embed.setDescription('No users found.')
      return messageToReply.edit({
        embeds: [embed]
      })
    }

    const formatted = top10.map((user, index) => {
      return `${`  **${index + 1}**  `}| User: ${user.username.replace(
        /_/,
        '\\_'
      )} - **${user.weeklyVouches}** vouches`
    })

    embed.setDescription(formatted.join('\n'))

    messageToReply.edit({
      embeds: [embed]
    })
  }
}
