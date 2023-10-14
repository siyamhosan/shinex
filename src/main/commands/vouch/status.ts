import { Command, CommandRun } from 'dtscommands'
import prisma from '../../../prisma.js'
import { BotEmbed, VouchEmbed } from '../../../utils/Embeds.js'
import { del30, del5 } from '../../../utils/fun.js'
import client from '../../../index.js'

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
    const vouch = await prisma.vouchs.findFirst({
      where: {
        id: parseInt(args[0])
      }
    })

    if (!vouch) {
      return message.channel
        .send({
          embeds: [
            new BotEmbed({
              title: 'Vouch not found',
              description: `Vouch with id \`${args[0]}\` was not found`,
              color: client.config.themeColors.ERROR
            })
          ]
        })
        .then(del5)
    }

    const embed = new VouchEmbed(vouch)

    await message
      .reply({
        embeds: [embed]
      })
      .then(del30)
  }
}
