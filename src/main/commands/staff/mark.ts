import { Colors } from 'discord.js'
import { Command, CommandRun } from 'dtscommands'
import { BotEmbed } from '../../../utils/Embeds.js'
import { UpdateProfile } from '../../../cache/profile.js'

export class MarkCmd extends Command {
  constructor () {
    super({
      name: 'mark',
      description: 'Mark a user',
      category: 'Staff',
      args: true,
      usage: '<user> <reason>',
      validation: ['vouch_staff']
    })
  }

  async run ({ message, args }: CommandRun) {
    const user =
      message.mentions.users.first() ||
      message.guild?.members.cache.get(args[0])?.user
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

    await UpdateProfile(user.id, {
      profileStatus: 'SCAMMER',
      markedBy: message.author.id,
      markedByUser: message.author.username,
      markedFor: reason,
      markedAt: new Date()
    })

    await message.channel.send({
      embeds: [embed]
    })
  }
}
