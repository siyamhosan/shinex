import { GuildMember, Message } from 'discord.js'
import { Command, CommandRun } from 'dtscommands'
import prisma from '../../../prisma.js'
import { BotEmbed, VouchNotification } from '../../../utils/Embeds.js'
import { CreatedVouch } from '../../../utils/vouch.js'

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

    let user: GuildMember | undefined

    if (args[0].startsWith('<@') && args[0].endsWith('>')) {
      user = await message.guild?.members.fetch(
        args[0].replace('<@', '').replace('>', '')
      )
    } else if (/\d+/.test(args[0])) {
      user = await message.guild?.members.fetch(args[0])
    } else if (args[0]) {
      const users = await message.guild?.members.search({
        query: args[0]
      })
      user = users?.first()
    }

    const comment = args.slice(1).join(' ')
    if (!user) {
      return message
        .reply({
          embeds: [
            new BotEmbed({
              title: 'Vouch Failed',
              description: 'Please mention a valid user to vouch',
              color: client.config.themeColors.ERROR
            })
          ]
        })
        .then(aDel)
    }

    if (user.user.bot) {
      return message
        .reply({
          embeds: [
            new BotEmbed({
              title: 'Vouch Failed',
              description: 'You cannot vouch a bot',
              color: client.config.themeColors.ERROR
            })
          ]
        })
        .then(aDel)
    }

    if (!comment) {
      return message
        .reply({
          embeds: [
            new BotEmbed({
              title: 'Vouch Failed',
              description: 'Please provide a comment to vouch',
              color: client.config.themeColors.ERROR
            })
          ]
        })
        .then(aDel)
    }

    if (comment.length > 240) {
      return message
        .reply({
          embeds: [
            new BotEmbed({
              title: 'Vouch Failed',
              description: 'Comment is too long.',
              color: client.config.themeColors.ERROR
            })
          ]
        })
        .then(aDel)
    }

    if (!/\d/.test(comment)) {
      return message
        .reply({
          embeds: [
            new BotEmbed({
              title: 'Vouch Failed',
              description:
                'Please mention a value of the trade in your comment.',
              color: client.config.themeColors.ERROR
            })
          ]
        })
        .then(aDel)
    }

    if (user.id === message.author.id) {
      return message
        .reply({
          embeds: [
            new BotEmbed({
              title: 'Vouch Failed',
              description: 'You cannot vouch yourself',
              color: client.config.themeColors.ERROR
            })
          ]
        })
        .then(aDel)
    }

    await message
      .reply({
        embeds: [
          new BotEmbed({
            title: 'Vouch Successful',
            description: `You have vouched <@${user.id}> with the comment \`${comment}\`\n\nThank you for vouching!`,
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
        receiverName: user.user.username,
        voucherId: message.author.id,
        voucherName: message.author.username,
        serverId: message.guild?.id,
        serverName: message.guild?.name,
        user: {
          connectOrCreate: {
            create: {
              userId: user.id,
              username: user.user.username
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
