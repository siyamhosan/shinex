import { Command, CommandRun } from 'dtscommands'
import client from '../../../index.js'
import { BotEmbed } from '../../../utils/Embeds.js'
import { ExtractIdsAndReason } from '../../../utils/fun.js'
import { OnDeny } from '../../../utils/vouch.js'
import vouchClient from '../../../vouchClient.js'
import { ShinexRoles } from '../../../utils/Validations.js'

export class DenyVouchCmd extends Command {
  constructor () {
    super({
      name: 'deny',
      description: 'Deny a vouch',
      category: 'Vouch',
      aliases: ['d'],

      validation: [ShinexRoles.ShinexStaffValidation],
      args: true,
      usage: '<vouchId> <reason>'
    })
  }

  async run ({ message, args }: CommandRun) {
    const { ids, reason } = ExtractIdsAndReason(args.join(' '))
    const vouches = await vouchClient.vouches.fetchAll({
      vouchId: ids.map(i => i.trim()).join(',')
    })

    let description = 'Denying vouches\n**Reason**: ' + reason + '\n\n'
    const embed = new BotEmbed()
      .setTitle('Staff Tools')
      .setDescription(description)

    const replyMessage = await message.channel.send({
      embeds: [embed]
    })

    let errorCount = 0

    for (const vouch of vouches) {
      if (vouch.isApproved) {
        description += `Vouch with id \`${vouch.id}\` is already denied\n`
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
        description += `- Vouch with id \`${vouch.id}\` cannot be denied by the voucher or receiver\n`
        await replyMessage.edit({
          embeds: [embed.setDescription(description)]
        })
        continue
      }

      let error = false

      await OnDeny(vouch, message.author, message, reason)
        .catch(async () => {
          description += `- Error denying vouch with id \`${vouch.id}\`\n`
          await replyMessage.edit({
            embeds: [embed.setDescription(description)]
          })
          error = true
          errorCount++
        })
        .then(async () => {
          if (error) return
          description += `- Vouch with id \`${vouch.id}\` has been denied\n`
          await replyMessage.edit({
            embeds: [embed.setDescription(description)]
          })
        })
    }

    description +=
      '\nDenied all vouches\nTotal vouches to deny: ' +
      (vouches.length - errorCount)
    await replyMessage.edit({
      embeds: [
        embed
          .setDescription(description)
          .setColor(client.config.themeColors.WARNING)
      ]
    })
  }
}
