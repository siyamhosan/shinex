import { Colors } from 'discord.js'
import { Command, CommandRun } from 'dtscommands'
import { BotEmbed } from '../../../utils/Embeds.js'
import { UserFromMessage } from '../../../utils/fun.js'
import vouchClient from '../../../vouchClient.js'
import { ShinexRoles } from '../../../utils/Validations.js'

export class MarkCmd extends Command {
  constructor () {
    super({
      name: 'mark',
      description: 'Mark a user',
      category: 'Staff',
      args: true,
      usage: '<user> <reason>',
      validation: [ShinexRoles.ShinexAdminValidation]
    })
  }

  async run ({ message, args }: CommandRun) {
    const user = await UserFromMessage(message, args)
    if (!user) return message.reply('You must mention a user to mark.')
    const reason = args.slice(1).join(' ')
    if (!reason) {
      return message.reply('You must provide a reason to mark the user.')
    }
    const embed = new BotEmbed()
    embed.setTitle('Staff Tools')
    embed.setDescription(
      `user: \`${user.username}\` is marked as \`SCAMMER\` for \`${reason}\``
    )
    embed.setColor(Colors.Red)
    embed.setFooter({
      text: 'Marked by ' + message.author.username + ' | Shinex'
    })

    await vouchClient.profiles.update(
      {
        id: user.id,
        username: user.username
      },
      {
        profileStatus: 'SCAMMER',
        mark: {
          for: reason,
          by: message.author.id,
          byUser: message.author.username,
          at: new Date()
        }
      }
    )

    await message.channel.send({
      embeds: [embed]
    })
  }
}
