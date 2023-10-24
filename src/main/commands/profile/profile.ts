import { Command, CommandRun } from 'dtscommands'
import { BotEmbed, ProfileEmbed } from '../../../utils/Embeds.js'
import {
  ColorsFromImage,
  HexStringToInt,
  UserFromMessage,
  del25,
  del60,
  del9
} from '../../../utils/fun.js'
import vouchClient from '../../../vouchClient.js'

export class ProfileCmd extends Command {
  constructor () {
    super({
      name: 'profile',
      description: 'Shows your profile',
      category: 'Profile',
      aliases: ['p'],
      usage: '[user]'
    })
  }

  async run ({ message, args }: CommandRun) {
    const userFetchStart = new Date().getTime()

    const user = await UserFromMessage(message, args, {
      authorAsDefault: true,
      authorFromMessageAsReply: true
    })
    if (!user) {
      return message.reply('unknown user').then(del9)
    }

    console.trace(userFetchStart, 'User fetch time took: ')

    if (user.bot) return

    const messageToReply = await message.channel.send({
      embeds: [
        new BotEmbed({
          title: `${user.username}'s Profile`,
          color: 0x1b03a3,
          thumbnail: {
            url: user.displayAvatarURL()
          },
          description: `**ID:** ${user.id}\n**Age:**<t:${Math.floor(
            user.createdAt.getTime() / 1000
          )}:D>\n**Display Name:** ${user.displayName}\n**Mention:** <@${
            user.id
          }>`
        })
      ]
    })

    const profileFetchStart = new Date().getTime()

    const profile =
      vouchClient.profiles.cache.get(user.id) ||
      (await vouchClient.profiles.fetch({
        id: user.id,
        username: user.username
      }))

    console.trace(profileFetchStart, 'Profile fetch time took: ')

    if (!profile) {
      return messageToReply.edit({
        embeds: [
          new BotEmbed({
            title: `${user.username}'s Profile`,
            thumbnail: {
              url: user.displayAvatarURL()
            },
            color: 0x1b03a3,
            description: 'Failed to load profile'
          })
        ]
      })
    }

    try {
      const embed = new ProfileEmbed(profile, user)

      await messageToReply
        .edit({
          embeds: [embed]
        })
        .then(msg => {
          if (message.author.id === user.id) {
            del60(msg)
          } else {
            del25(msg)
          }
        })

      if (!profile.color) {
        const colors = await ColorsFromImage(
          user.displayAvatarURL({
            forceStatic: true,
            extension: 'png'
          })
        )
        const color = HexStringToInt(colors[0])
        await messageToReply.edit({
          embeds: [embed.setColor(color)]
        })
      }
    } catch (error) {
      console.log(error)
    }
  }
}
