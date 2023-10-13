import { Command, CommandRun } from 'dtscommands'
import { BotEmbed } from '../../../utils/Embeds.js'
import { DenyReasons, OnDeny } from '../../../utils/vouch.js'
import { Colors } from 'discord.js'
import { del5 } from '../../../utils/fun.js'
import prisma from '../../../prisma.js'

export class DenyVouchCmd extends Command {
  constructor () {
    super({
      name: 'deny',
      description: 'Deny a vouch',
      category: 'Vouch',
      aliases: ['d'],
      validation: ['vouch_staff'],
      args: true,
      usage: '<vouchId> <reason>'
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
    } else if (vouch.vouchStatus === 'DENIED') {
      return message.channel.send('Vouch already denied').then(del5)
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
    const reason =
      DenyReasons[args[1].toUpperCase() as keyof typeof DenyReasons] ||
      args.slice(1).join(' ')

    await OnDeny(vouch, message.author, message, reason)

    await message.channel.send({
      embeds: [
        new BotEmbed({
          title: 'Vouch Denied',
          description: `Vouch with id \`${vouch.id}\` has been denied by ${message.author} with reason \`${reason}\``,
          color: Colors.Red
        })
      ]
    })
  }
}
