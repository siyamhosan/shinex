import { GuildMember } from 'discord.js'
import { Event } from 'dtscommands'
import { UpdateProfile } from '../../../cache/profile.js'

export class NewMember extends Event<'guildMemberAdd'> {
  constructor () {
    super({
      name: 'guildMemberAdd',
      nick: 'New Member'
    })
  }

  async run (member: GuildMember) {
    const guild = member.guild
    if (guild.id !== '1157258354821971998') return

    await member.roles.add('1157693300074086423')

    await UpdateProfile(member.id, {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      badges: {
        push: 'MEMBER'
      }
    }).catch(console.error)
  }
}
