import { GuildMember } from 'discord.js'
import { Event } from 'dtscommands'
import vouchClient from '../../../vouchClient.js'

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

    const profile = await vouchClient.profiles.fetch({
      username: member.user.username,
      id: member.id
    })

    if (!profile) return

    await profile.addBadge('MEMBER')
  }
}
