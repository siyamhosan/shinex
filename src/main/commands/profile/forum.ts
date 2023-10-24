import { Command, CommandRun } from 'dtscommands'
import { ProfileEmbed } from '../../../utils/Embeds.js'
import { del9 } from '../../../utils/fun.js'
import vouchClient from '../../../vouchClient.js'

export class SetForumCmd extends Command {
  constructor () {
    super({
      name: 'forum',
      category: 'Profile',
      description: 'Set your forum profile',
      args: true,
      usage: 'forum'
    })
  }

  async run ({ message, args }: CommandRun) {
    const forum = args.join(' ').trim()

    if (forum.length > 200) {
      return message.channel.send('Forum is too long').then(del9)
    }

    const profile = await vouchClient.profiles.update(
      { id: message.author.id, username: message.author.username },
      {
        forum
      }
    )

    if (!profile) {
      return message.channel.send('Failed to update profile').then(del9)
    }

    const embed = new ProfileEmbed(profile, message.author)

    await message.channel
      .send({
        content: 'Your forum has been set',
        embeds: [embed]
      })
      .then(del9)
  }
}
