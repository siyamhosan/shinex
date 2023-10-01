import { Command, CommandRun } from 'dtscommands'
import { BotEmbed } from '../../../utils/Embeds.js'
import { DenyReasons } from '../../../utils/vouch.js'

export class DenyReasonCmd extends Command {
  constructor () {
    super({
      name: 'denyreason',
      description: 'See the deny reasons for a vouch',
      category: 'Staff',
      validation: ['vouch_staff']
    })
  }

  async run ({ message }: CommandRun) {
    const embed = new BotEmbed()
    embed.setTitle('Vouch Deny Reason help')

    embed
      .addFields(
        {
          name: 'Usage',
          value: '`!deny <vouchId> <reason>`'
        },
        {
          name: 'Shortcuts',
          value: Object.keys(DenyReasons)
            .map(key => `\`${key}\``)
            .join(', ')
        },
        {
          name: 'Custom Reasons',
          value:
            'You can also use custom reasons by typing the reason after the vouch id.'
        }
      )
      .setColor(0x1b03a3)

    await message.channel.send({
      embeds: [embed]
    })
  }
}
