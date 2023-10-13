import { GuildMember } from 'discord.js'
import { Command, CommandRun } from 'dtscommands'
import { GetProfile } from '../../../cache/profile.js'
import { BotEmbed, ProfileEmbed } from '../../../utils/Embeds.js'

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
    let user: GuildMember | null | undefined = message.member

    if (args[0] && args[0].startsWith('<@') && args[0].endsWith('>')) {
      user = await message.guild?.members.fetch(
        args[0].replace('<@', '').replace('>', '')
      )
    } else if (args[0] && /\d+/.test(args[0])) {
      user = await message.guild?.members.fetch(args[0])
    } else if (args[0]) {
      const users = await message.guild?.members.search({
        query: args[0]
      })
      user = users?.first()
    }
    if (!user) {
      return message.reply('unknown user')
    }

    if (user.user.bot) return

    const messageToReply = await message.channel.send({
      embeds: [
        new BotEmbed({
          title: `${user.user.username}'s Profile`,
          color: 0x1b03a3,
          description: 'Loading...'
        })
      ]
    })

    const profile = await GetProfile(user.id, user.user.username)

    try {
      const embed = ProfileEmbed(profile, user.user)

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
