import { Command, CommandRun } from 'dtscommands'
import prisma from '../../../prisma.js'
import { OnApprove } from '../../../utils/vouch.js'
import { del5 } from '../../../utils/fun.js'
import { BotEmbed } from '../../../utils/Embeds.js'
import { Colors } from 'discord.js'

export class ApproveVouchCmd extends Command {
  constructor () {
    super({
      name: 'approve',
      description: 'Approve a vouch',
      category: 'Vouch',
      aliases: ['a', 'accept'],
      manager: true,
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
      return message.channel.send('Vouch not found').then(del5)
    } else if (vouch.vouchStatus === 'APPROVED') {
      return message.channel.send('Vouch already approved').then(del5)
    }

    await OnApprove(vouch, message.author)

    await message.channel.send({
      embeds: [
        new BotEmbed({
          title: 'Vouch Approved',
          description: `Vouch with id \`${vouch.id}\` has been approved`,
          color: Colors.Green
        })
      ]
    })
  }
}
