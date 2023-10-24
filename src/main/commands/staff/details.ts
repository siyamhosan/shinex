import { Command, CommandRun } from 'dtscommands'
import { ShinexRoles, isAnyStaff } from '../../../utils/Validations.js'
import { ExtractIdsAndReason, del30 } from '../../../utils/fun.js'
import vouchClient from '../../../vouchClient.js'
import { VouchEmbed } from '../../../utils/Embeds.js'

export class VouchDetailsCmd extends Command {
  constructor () {
    super({
      name: 'details',
      description: 'Get details about a vouch',
      category: 'staff',
      args: true,
      aliases: ['detail'],
      validation: [ShinexRoles.ShinexSeniorModValidation]
    })
  }

  async run ({ message, args }: CommandRun) {
    const { ids } = ExtractIdsAndReason(args.join(' '))
    const vouches = (
      await vouchClient.vouches.fetchAll({
        vouchId: ids.map(i => i.trim()).join(',')
      })
    ).filter(v => v.isPending)

    for (const vouch of vouches) {
      const embed = new VouchEmbed(vouch)
      embed.setActivities()

      if (!vouch.isRelevantTo && !isAnyStaff(message.author.id)) {
        embed
          .setDescription(
            'This vouch is not relevant to you, so you cannot see it.'
          )
          .setFields([])
      }

      await message.channel
        .send({
          embeds: [embed]
        })
        .then(() => {
          if (
            !isAnyStaff(message.author.id) &&
            !message.content.includes('get')
          ) {
            del30(message)
          }
        })
    }

    await message.delete()
  }
}
