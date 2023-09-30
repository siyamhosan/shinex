import { Command, CommandRun } from 'dtscommands'
import { UpdateProfile } from '../../../cache/profile.js'
import { ProfileEmbed } from '../../../utils/Embeds.js'
import { del9 } from '../../../utils/fun.js'

export class SetShopCmd extends Command {
  constructor () {
    super({
      name: 'shop',
      description: 'Set your shop',
      category: 'Profile'
    })
  }

  async run ({ message, args }: CommandRun) {
    const shop = args.join(' ')

    const profile = await UpdateProfile(message.author.id, {
      shop
    })

    const embed = ProfileEmbed(profile, message.author)

    await message.channel
      .send({
        content: 'Your shop has been set',
        embeds: [embed]
      })
      .then(del9)
  }
}
