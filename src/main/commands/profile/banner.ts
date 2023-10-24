import { Command, CommandRun } from 'dtscommands'
import { ProfileEmbed } from '../../../utils/Embeds.js'
import { del9 } from '../../../utils/fun.js'
import vouchClient from '../../../vouchClient.js'

export class SetBannerCmd extends Command {
  constructor () {
    super({
      category: 'Profile',

      description: 'Set your banner',

      name: 'banner',
      args: true,
      usage: '<banner link>'
    })
  }

  async run ({ message, args }: CommandRun) {
    const banner = args.join(' ').trim()

    if (banner.length > 200) {
      return message.channel.send('Banner link is too long').then(del9)
    }

    const profile = await vouchClient.profiles.update(
      { id: message.author.id, username: message.author.username },
      {
        banner
      }
    )

    if (!profile) {
      return message.channel.send('Failed to update profile').then(del9)
    }

    const embed = new ProfileEmbed(profile, message.author)

    await message.channel
      .send({
        content: 'Your banner has been set',
        embeds: [embed]
      })
      .then(del9)
  }
}
