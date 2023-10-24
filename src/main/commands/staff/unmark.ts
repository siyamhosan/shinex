import { Colors } from 'discord.js'
import { Command, CommandRun } from 'dtscommands'
import { BotEmbed } from '../../../utils/Embeds.js'
import vouchClient from '../../../vouchClient.js'
import { UserFromMessage } from '../../../utils/fun.js'
import { ShinexRoles } from '../../../utils/Validations.js'

export class UnMarkCmd extends Command {
  constructor () {
    super({
      name: 'unmark',
      description: 'Unmark a user',
      category: 'Staff',
      args: true,
      usage: '<user>',
      validation: [ShinexRoles.ShinexAdminValidation]
    })
  }

  async run ({ message, args }: CommandRun) {
    const user = await UserFromMessage(message, args, false)
    if (!user) return message.reply('You must mention a user to unmark.')

    const embed = new BotEmbed()
    embed.setTitle('Staff Tools')
    embed.setDescription(
      `user: \`${user.username}\` is unmarked as \`SCAMMER\``
    )
    embed.setColor(Colors.Red)
    embed.setFooter({
      text: 'Unmarked by ' + message.author.username + ' | Shinex'
    })

    await vouchClient.profiles.update(
      {
        id: user.id,
        username: user.username
      },
      {
        profileStatus: 'GOOD',
        mark: {},
        warning: {}
      }
    )

    await message.channel.send({
      embeds: [embed]
    })
  }
}
