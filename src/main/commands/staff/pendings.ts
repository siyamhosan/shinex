import { Command, CommandRun } from 'dtscommands'
import { VouchStatusSchema } from 'vouchapi'
import { BotEmbed } from '../../../utils/Embeds.js'
import { UserFromMessage } from '../../../utils/fun.js'
import { VouchStatusMap, VouchStatusShortMap } from '../../../utils/vouch.js'
import vouchClient from '../../../vouchClient.js'
import { ShinexRoles } from '../../../utils/Validations.js'

export class StaffVouchPending extends Command {
  constructor () {
    super({
      name: 'pending',
      description: 'View all pending vouches',
      category: 'Staff',
      usage: '<user> <type?>',
      aliases: ['pendings', 'pendingvouches', 'pendingvouch'],
      validation: [ShinexRoles.ShinexStaffValidation]
    })
  }

  async run ({ message, args, client }: CommandRun) {
    const replyEmbed = new BotEmbed({
      title: 'Pending Vouches',
      description: 'Loading pending vouches...'
    })
    const reply = await message.channel.send({ embeds: [replyEmbed] })

    const user = await UserFromMessage(message, args, {
      authorFromMessageAsReply: true
    })

    const type = args[1]

    if (
      type &&
      VouchStatusShortMap[
        type.toUpperCase() as typeof VouchStatusSchema._type
      ] === undefined
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

    const vouches = await vouchClient.vouches.fetchAll({ profileId: user?.id })

    const pendingVouches = vouches
      .filter(vouch => vouch.vouchStatus.toUpperCase() === 'UNCHECKED')
      .sort((a, b) => Number(a.id) - Number(b.id))

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
                    return `${vouch.id} - ${
                      VouchStatusMap[
                        vouch.vouchStatus.toUpperCase() as typeof VouchStatusSchema._type
                      ]
                    }`
                  }
                })
                .join('\n')
            )
            .setColor(client.config.themeColors.SUCCESS)
            .setAuthor({
              name: user?.username || message.author.displayName,
              iconURL:
                user?.displayAvatarURL({ forceStatic: false }) ||
                message.author.displayAvatarURL({ forceStatic: false })
            })
            .setTitle(
              'Pending ' + (type || 'Vouches') + ' | ' + pendingVouches.length
            )
        ]
      })
      .then(() => message.delete())
  }
}
