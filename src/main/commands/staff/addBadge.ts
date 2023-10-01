/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Colors } from 'discord.js'
import { Command, CommandRun } from 'dtscommands'
import { BotEmbed } from '../../../utils/Embeds.js'
import { UpdateProfile } from '../../../cache/profile.js'
import { Badges } from '@prisma/client'

export class AddBadgeCmd extends Command {
  constructor () {
    super({
      name: 'addbadge',
      description: 'Add a badge to a user',
      category: 'Staff',
      validation: ['vouch_staff'],
      args: true,
      usage: '<user> <badge>'
    })
  }

  async run ({ message, args }: CommandRun) {
    const user =
      message.mentions.users.first() ||
      message.guild?.members.cache.get(args[0])?.user
    if (!user) return message.reply('You must mention a user to add badge.')
    const badge = args.slice(1).join(' ').toUpperCase()
    if (!badge) {
      return message.reply('You must provide a badge to add to the user.')
    }

    if (
      Badges[badge as Badges] === undefined ||
      Badges[badge as Badges] === null
    ) {
      return message.reply(
        'Invalid Badge\n' + Object.keys(Badges).join(', ') + '.'
      )
    }

    const embed = new BotEmbed()
    embed.setTitle('Staff Tools')
    embed.setDescription(
      `user: \`${user.username}\` is added with badge \`${badge}\``
    )
    embed.setColor(Colors.Red)
    embed.setFooter({
      text: 'Badge added by ' + message.author.username + ' | Shinex'
    })

    await UpdateProfile(user.id, {
      // @ts-ignore
      badges: {
        push: badge
      }
    })

    await message.channel.send({
      embeds: [embed]
    })
  }
}
