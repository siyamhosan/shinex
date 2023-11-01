import { Command, CommandRun } from 'dtscommands'
import { BotEmbed } from '../../../utils/Embeds.js'
import { ExtractIdsAndReason } from '../../../utils/fun.js'
import { OnApprove } from '../../../utils/vouch.js'
import vouchClient from '../../../vouchClient.js'
import client from '../../../index.js'
import { ShinexRoles } from '../../../utils/Validations.js'

export class ApproveVouchCmd extends Command {
  constructor () {
    super({
      name: 'approve',
      description: 'Approve a vouch',
      category: 'Vouch',
      aliases: ['a', 'accept'],
      validation: [ShinexRoles.ShinexStaffValidation],
      args: true,
      usage: '<vouchId>'
    })
  }

  async run ({ message, args }: CommandRun) {
    const { ids } = ExtractIdsAndReason(args.join(' '))
    const vouches = await vouchClient.vouches.fetchAll({
      vouchId: ids.map(i => i.trim()).join(',')
    })

    let description = 'Approving vouches\n'
    const embed = new BotEmbed()
      .setTitle('Staff Tools')
      .setDescription(description)

    const replyMessage = await message.reply({
      embeds: [embed]
    })

    if (!vouches.length) {
      return replyMessage.edit({
        embeds: [
          embed
            .setDescription('No vouches found')
            .setColor(client.config.themeColors.ERROR)
        ]
      })
    }

    let errorCount = 0

    for (const vouch of vouches) {
      if (vouch.isApproved) {
        description += `Vouch with id \`${vouch.id}\` is already approved\n`
        await replyMessage.edit({
          embeds: [embed.setDescription(description)]
        })
        continue
      }

      if (
        (vouch.receiverId === message.author.id ||
          vouch.voucherId === message.author.id) &&
        !process.env.DEV
      ) {
        description += `- Vouch with id \`${vouch.id}\` cannot be approved by the voucher or receiver\n`
        await replyMessage.edit({
          embeds: [embed.setDescription(description)]
        })
        continue
      }

      let error = false

      await OnApprove(vouch, message.author, message)
        .catch(async () => {
          description += `- Failed approving vouch with id \`${vouch.id}\`\n`
          await replyMessage.edit({
            embeds: [embed.setDescription(description)]
          })
          error = true
          errorCount++
        })
        .then(async () => {
          if (error) return
          description += `- Vouch with id \`${vouch.id}\` has been approved\n`
          await replyMessage.edit({
            embeds: [embed.setDescription(description)]
          })
        })
    }

    const successCount = vouches.length - errorCount

    description +=
      '\nApproved all vouches\nTotal vouches to approved: ' + successCount
    await replyMessage.edit({
      embeds: [
        embed
          .setDescription(description)
          .setColor(
            successCount < errorCount
              ? client.config.themeColors.ERROR
              : client.config.themeColors.SUCCESS
          )
      ]
    })
  }
}
