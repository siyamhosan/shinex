import { Command, CommandRun } from 'dtscommands'
import { UpdateProfile } from '../../../cache/profile.js'
import { ProfileEmbed } from '../../../utils/Embeds.js'
import { del9 } from '../../../utils/fun.js'

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
    const banner = args.join(' ')
    const profile = await UpdateProfile(message.author.id, {
      banner
    })

    const embed = ProfileEmbed(profile, message.author)

    await message.channel
      .send({
        content: 'Your banner has been set',
        embeds: [embed]
      })
      .then(del9)
  }
}
