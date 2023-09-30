import { Command, CommandRun } from 'dtscommands'
import { UpdateProfile } from '../../../cache/profile.js'
import { ProfileEmbed } from '../../../utils/Embeds.js'
import { del9 } from '../../../utils/fun.js'

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
    const forum = args.join(' ')
    const profile = await UpdateProfile(message.author.id, {
      forum
    })

    const embed = ProfileEmbed(profile, message.author)

    await message.channel
      .send({
        content: 'Your forum has been set',
        embeds: [embed]
      })
      .then(del9)
  }
}
