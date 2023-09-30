import { Command, CommandRun } from 'dtscommands'
import prisma from '../../../prisma.js'
import { VouchEmbed } from '../../../utils/Embeds.js'
import { del30, del5 } from '../../../utils/fun.js'

export class StatusCommand extends Command {
  constructor () {
    super({
      name: 'status',
      description: 'Shows the status of a vouch',
      category: 'Vouch',
      aliases: ['get'],
      args: true,
      usage: '<vouchId>'
    })
  }

  async run ({ message, args }: CommandRun) {
    const vouch = await prisma.vouch.findFirst({
      where: {
        id: parseInt(args[0])
      }
    })

    if (!vouch) {
      return message.channel.send('Unknown vouch').then(del5)
    }

    const embed = VouchEmbed(vouch)

    await message
      .reply({
        embeds: [embed]
      })
      .then(del30)
  }
}
