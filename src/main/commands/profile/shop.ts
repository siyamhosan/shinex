import { Command, CommandRun } from 'dtscommands'
import { ProfileEmbed } from '../../../utils/Embeds.js'
import { del9 } from '../../../utils/fun.js'
import vouchClient from '../../../vouchClient.js'

export class SetShopCmd extends Command {
  constructor () {
    super({
      name: 'shop',
      description: 'Set your shop',
      category: 'Profile'
    })
  }

  async run ({ message, args }: CommandRun) {
    const shop = args.join(' ').trim()

    if (shop.length > 200) {
      return message.channel.send('Shop is too long').then(del9)
    }

    const profile = await vouchClient.profiles.update(
      { id: message.author.id, username: message.author.username },
      { shop }
    )

    if (!profile) {
      return message.channel.send('Failed to update profile').then(del9)
    }

    const embed = new ProfileEmbed(profile, message.author)

    await message.channel
      .send({
        content: 'Your shop has been set',
        embeds: [embed]
      })
      .then(del9)
  }
}
