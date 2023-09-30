import { Command, CommandRun } from 'dtscommands'
import prisma from '../../../prisma.js'
import { Colors, EmbedBuilder, Message } from 'discord.js'
import { CreatedVouch } from '../../../utils/vouch.js'
import { VouchNotification } from '../../../utils/Embeds.js'

export class VouchCmd extends Command {
  constructor () {
    super({
      name: 'vouch',
      category: 'Vouch',
      description: 'Vouch a user',
      aliases: ['rep'],
      args: true,
      usage: '<user> <comment>'
    })
  }

  async run ({ message, client, args }: CommandRun) {
    if (!message.guild) {
      return message.reply('This command can only be used in a server')
    }

    const user =
      message.mentions.users?.first() || client.users.cache.get(args[0])

    const comment = args.slice(1).join(' ')
    if (!user || !comment) {
      return message.reply('Use Correctly `vouch <user> <comment>`').then(aDel)
    }

    if (user.id === message.author.id) {
      return message.reply('You cannot vouch yourself').then(aDel)
    }

    await message
      .reply({
        embeds: [
          new EmbedBuilder({
            title: 'Vouch Successful',
            description: `You have vouched <@${user.id}> with the comment \`${comment}\``,
            color: 0x1b03a3
          })
        ]
      })
      .then(msg => {
        setTimeout(() => {
          msg.delete()
        }, 9000)
      })

    const vouch = await prisma.vouch.create({
      data: {
        comment,
        receiverId: user.id,
        receiverName: user.username,
        voucherId: message.author.id,
        voucherName: message.author.username,
        serverId: message.guild?.id,
        serverName: message.guild?.name,
        user: {
          connectOrCreate: {
            create: {
              userId: user.id,
              username: user.username
            },
            where: {
              userId: user.id
            }
          }
        }
      }
    })

    await user.send({
      embeds: [
        new VouchNotification({
          description: `You have received a vouch \`${vouch.id}\` by \`${vouch.voucherName}\`.`
        })
      ]
    })
    CreatedVouch(vouch)
  }
}

function aDel (msg: Message) {
  setTimeout(() => {
    msg.delete()
  }, 5000)
}
