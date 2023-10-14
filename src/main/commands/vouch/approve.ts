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
      validation: ['vouch_staff'],
      args: true,
      usage: '<vouchId>'
    })
  }

  async run ({ message, args }: CommandRun) {
    const vouch = await prisma.vouchs.findFirst({
      where: {
        id: parseInt(args[0])
      }
    })

    if (!vouch) {
      return message.channel.send('Vouch not found').then(del5)
    } else if (vouch.vouchStatus === 'APPROVED') {
      return message.channel.send('Vouch already approved').then(del5)
    }

    if (
      (vouch.receiverId === message.author.id ||
        vouch.voucherId === message.author.id) &&
      !process.env.DEV
    ) {
      return message
        .reply({
          content: 'You can not control vouches related to you!'
        })
        .then(del5)
    }

    await OnApprove(vouch, message.author, message)

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
