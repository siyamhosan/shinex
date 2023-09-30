import { Colors, EmbedBuilder } from 'discord.js'
import { Command, CommandRun } from 'dtscommands'
import { GetProfile } from '../../../cache/profile.js'
import { ProfileEmbed } from '../../../utils/Embeds.js'

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

  async run ({ message, args, client }: CommandRun) {
    let user = message.mentions.users?.first() || message.author

    if (args[0] && !message.mentions.users?.first()) {
      user = await client.users.fetch(args[0])
    }
    if (!user) {
      return message.reply('unknown user')
    }

    if (user.bot) return

    const messageToReply = await message.channel.send({
      embeds: [
        new EmbedBuilder({
          title: `${user.username}'s Profile`,
          color: 0x1b03a3,
          description: 'Loading...',
          footer: {
            text: 'Shinex | Vouching System. discord.gg/tnt2NYgUBB'
          }
        })
      ]
    })

    const profile = await GetProfile(user.id, user.username)

    try {
      const embed = ProfileEmbed(profile, user)

      await messageToReply
        .edit({
          embeds: [embed]
        })
        .then(msg => {
          setTimeout(() => {
            msg.delete()
          }, 25000)
        })
    } catch (error) {
      console.log(error)
    }
  }
}
