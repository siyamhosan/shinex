import { Command, CommandRun } from 'dtscommands'
import { BotEmbed } from '../../../utils/Embeds.js'
import { Colors } from 'discord.js'
import { UpdateProfile } from '../../../cache/profile.js'

export class DwcCommand extends Command {
  constructor () {
    super({
      name: 'dwc',
      description: 'Mark DWC a user',
      category: 'Staff',
      args: true,
      usage: '<user>',
      manager: true
    })
  }

  async run ({ message, args }: CommandRun) {
    const user =
      message.mentions.users.first() ||
      message.guild?.members.cache.get(args[0])?.user
    if (!user) return message.reply('You must mention a user to DWC.')
    const reason = args.slice(1).join(' ')
    if (!reason) {
      return message.reply('You must provide a reason to DWC the user.')
    }
    const embed = new BotEmbed()
    embed.setTitle('Staff Tools')
    embed.setDescription(
      `user: \`${user.username}\` is marked as \`DWC\` for \`${reason}\``
    )
    embed.setColor(Colors.Red)
    embed.setFooter({
      text: 'DWC by ' + message.author.username + ' | Shinex'
    })

    await UpdateProfile(user.id, {
      profileStatus: 'WARN',
      warningBy: message.author.id,
      warningByUser: message.author.username,
      waringReason: '⚠ DEAL WITH CAUTION ⚠',
      warningAt: new Date()
    })

    await message.channel.send({
      embeds: [embed]
    })
  }
}
