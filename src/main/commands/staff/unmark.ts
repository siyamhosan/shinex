import { Colors } from 'discord.js'
import { Command, CommandRun } from 'dtscommands'
import { UpdateProfile } from '../../../cache/profile.js'
import { BotEmbed } from '../../../utils/Embeds.js'

export class UnMarkCmd extends Command {
  constructor () {
    super({
      name: 'unmark',
      description: 'Unmark a user',
      category: 'Staff',
      args: true,
      usage: '<user>',
      validation: ['vouch_staff']
    })
  }

  async run ({ message, args }: CommandRun) {
    const user =
      message.mentions.users.first() ||
      message.guild?.members.cache.get(args[0])?.user
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

    await UpdateProfile(user.id, {
      profileStatus: 'GOOD',
      markedBy: null,
      markedByUser: null,
      markedFor: null,
      markedAt: null
    })

    await message.channel.send({
      embeds: [embed]
    })
  }
}
