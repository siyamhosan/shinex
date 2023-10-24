import { Command, CommandRun } from 'dtscommands'
import { ExtractIdsAndReason } from '../../../utils/fun.js'
import vouchClient from '../../../vouchClient.js'
import { BotEmbed } from '../../../utils/Embeds.js'
import client from '../../../index.js'
import { ShinexRoles } from '../../../utils/Validations.js'

export class DeleteVouchCmd extends Command {
  constructor () {
    super({
      name: 'delete',
      description: 'Delete a vouch',
      category: 'Vouch',
      args: true,
      usage: '<vouchId>',

      validation: [ShinexRoles.ShinexSeniorModValidation]
    })
  }

  async run ({ message, args }: CommandRun) {
    const { ids } = ExtractIdsAndReason(args.join(' '))
    const vouches = await vouchClient.vouches.fetchAll({
      vouchId: ids.map(i => i.trim()).join(',')
    })

    let description = 'Deleting vouches\n'
    const embed = new BotEmbed()
      .setTitle('Staff Tools')
      .setDescription(description)

    const replyMessage = await message.reply({
      embeds: [embed]
    })

    let errorCount = 0

    for (const vouch of vouches) {
      if (vouch.isDeleted) {
        description += `Vouch with id \`${vouch.id}\` is already deleted\n`
        await replyMessage.edit({
          embeds: [embed.setDescription(description)]
        })
        continue
      }

      let error = false

      try {
        await vouchClient.vouches.delete(vouch.id, {
          staffId: message.author.id,
          staffName: message.author.username,
          reason: 'Deleted by staff'
        })
      } catch (err) {
        error = true
        errorCount++
        description += `Failed to delete vouch with id \`${vouch.id}\`\n`
        await replyMessage.edit({
          embeds: [embed.setDescription(description)]
        })
      } finally {
        if (!error) {
          description += `Deleted vouch with id \`${vouch.id}\`\n`
          await replyMessage.edit({
            embeds: [embed.setDescription(description)]
          })
        }
      }
    }

    description +=
      '\nDeleted all vouches\nTotal vouches to deleted: ' +
      (vouches.length - errorCount)
    await replyMessage.edit({
      embeds: [
        embed
          .setDescription(description)
          .setColor(client.config.themeColors.SUCCESS)
      ]
    })
  }
}
