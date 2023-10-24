/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Colors } from 'discord.js'
import { Command, CommandRun } from 'dtscommands'
import { BotEmbed } from '../../../utils/Embeds.js'
import { UserFromMessage } from '../../../utils/fun.js'
import vouchClient from '../../../vouchClient.js'
import { BadgeType, Badges } from '../../../utils/profile.js'
import { ShinexRoles } from '../../../utils/Validations.js'

export class AddBadgeCmd extends Command {
  constructor () {
    super({
      name: 'addbadge',
      description: 'Add a badge to a user',
      category: 'Staff',
      validation: [ShinexRoles.ShinexAdminValidation],
      args: true,
      usage: '<user> <badge>'
    })
  }

  async run ({ message, args }: CommandRun) {
    const user = await UserFromMessage(message, args)

    if (!user) return message.reply('You must mention a user to add badge.')
    const badge = args.slice(1).join(' ').toUpperCase()
    if (!badge) {
      return message.reply('You must provide a badge to add to the user.')
    }

    if (!Badges.includes(badge as BadgeType)) {
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

    const profile =
      vouchClient.profiles.cache.get(user.id) ||
      (await vouchClient.profiles.fetch({
        id: user.id,
        username: user.username
      }))
    if (!profile) {
      return message.channel.send('Failed to update profile')
    }

    const badges = profile.badges
    if (badges.includes(badge)) {
      return message.reply('User already has this badge.')
    }

    await profile.addBadge(badge)

    await message.channel.send({
      embeds: [embed]
    })
  }
}
