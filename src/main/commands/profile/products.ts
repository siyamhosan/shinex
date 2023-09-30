import { Command, CommandRun } from 'dtscommands'
import { UpdateProfile } from '../../../cache/profile.js'
import { ProfileEmbed } from '../../../utils/Embeds.js'
import { del9 } from '../../../utils/fun.js'

export class SetProductsCmd extends Command {
  constructor () {
    super({
      name: 'products',
      description: 'Set your products',
      category: 'Profile',
      args: true,
      usage: '<products>'
    })
  }

  async run ({ message, args }: CommandRun) {
    const products = args.join(' ')
    const profile = await UpdateProfile(message.author.id, {
      products
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
