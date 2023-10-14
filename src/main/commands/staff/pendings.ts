import { GuildMember } from 'discord.js'
import { Command, CommandRun } from 'dtscommands'
import prisma from '../../../prisma.js'
import { BotEmbed } from '../../../utils/Embeds.js'
import { VouchStatus } from '@prisma/client'
import { VouchStatusMap, VouchStatusShortMap } from '../../../utils/vouch.js'

export class StaffVouchPending extends Command {
  constructor () {
    super({
      name: 'pending',
      description: 'View all pending vouches',
      category: 'Staff',
      usage: '<user> <type?>',
      aliases: ['pendings', 'pendingvouches', 'pendingvouch']
    })
  }

  async run ({ message, args, client }: CommandRun) {
    const replyEmbed = new BotEmbed({
      title: 'Pending Vouches',
      description: 'Loading pending vouches...'
    })
    const reply = await message.channel.send({ embeds: [replyEmbed] })

    let user: GuildMember | undefined

    if (args[0].startsWith('<@') && args[0].endsWith('>')) {
      user = await message.guild?.members.fetch(
        args[0].replace('<@', '').replace('>', '')
      )
    } else if (/\d+/.test(args[0])) {
      user = await message.guild?.members.fetch(args[0])
    } else if (args[0]) {
      const users = await message.guild?.members.search({
        query: args[0]
      })
      user = users?.first()
    }

    if (!user) {
      return reply.edit({
        embeds: [
          replyEmbed
            .setDescription('User not found')
            .setColor(client.config.themeColors.ERROR)
        ]
      })
    }

    const type = args[1]

    if (
      type &&
      VouchStatusShortMap[type.toUpperCase() as VouchStatus] === undefined
    ) {
      return reply.edit({
        embeds: [
          replyEmbed
            .setDescription(
              `Invalid type \`${type}\`\nValid types: \`${Object.keys(
                VouchStatusShortMap
              ).join('`, `')}\``
            )
            .setColor(client.config.themeColors.ERROR)
        ]
      })
    }

    const vouches = await prisma.vouchs.findMany({
      where: {
        receiverId: user.id
      },
      select: {
        id: true,
        vouchStatus: true
      }
    })

    const pendingVouches = vouches.filter(
      vouch =>
        (!type ||
          vouch.vouchStatus ===
            VouchStatusShortMap[type.toUpperCase() as VouchStatus]) &&
        vouch.vouchStatus !== 'APPROVED'
    )

    if (!pendingVouches.length) {
      return reply.edit({
        embeds: [
          replyEmbed
            .setDescription(
              'No pending vouches' +
                (type ? ` of type \`${type}\`` : '') +
                ' found'
            )
            .setColor(client.config.themeColors.SECONDARY)
        ]
      })
    }

    reply
      .edit({
        embeds: [
          replyEmbed
            .setDescription(
              pendingVouches
                .map(vouch => {
                  if (type) {
                    return `${vouch.id}`
                  } else {
                    return `${vouch.id} - ${VouchStatusMap[vouch.vouchStatus]}`
                  }
                })
                .join('\n')
            )
            .setColor(client.config.themeColors.SUCCESS)
            .setAuthor({
              name: user.user.username,
              iconURL: user.user.displayAvatarURL({ forceStatic: false })
            })
            .setTitle(
              'Pending ' + (type || 'Vouches') + ' | ' + pendingVouches.length
            )
        ]
      })
      .then(() => message.delete())
  }
}
