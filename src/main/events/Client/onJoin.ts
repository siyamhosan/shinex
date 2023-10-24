import { Event } from 'dtscommands'
import client from '../../../index.js'
import {
  ChannelType,
  Colors,
  EmbedBuilder,
  Guild,
  TextChannel
} from 'discord.js'
import moment from 'moment'
import vouchClient from '../../../vouchClient.js'
import { ON_JOIN_CHANNEL_ID } from '../../../config.js'

export class OnJoinEvent extends Event<'guildCreate'> {
  constructor () {
    super({
      name: 'guildCreate',
      nick: 'OnJoin'
    })
  }

  async run (guild: Guild) {
    const channel = client.channels.cache.get(ON_JOIN_CHANNEL_ID) as TextChannel
    const own = await guild?.fetchOwner()
    const text = guild.channels.cache.find(
      c =>
        c.type === ChannelType.GuildText &&
        c.permissionsFor(client.user?.id || '0000')?.has('CreateInstantInvite')
    ) as TextChannel
    let invite = { code: 'xxxxxx' }
    if (text) {
      invite = await text.createInvite({
        reason: `For ${client.user?.tag} Developer(s)`,
        maxAge: 0
      })
    }
    const embed = new EmbedBuilder()
      .setThumbnail(guild.iconURL({ size: 1024 }))
      .setTitle('📥 Joined a Guild !!')
      .setColor(Colors.Green)
      .addFields([
        { name: 'Name', value: `\`${guild.name}\`` },
        { name: 'ID', value: `\`${guild.id}\`` },
        {
          name: 'Owner',
          value: `\`${own.user.username || 'Unknown user'}\` ${own.id}`
        },
        { name: 'Member Count', value: `\`${guild.memberCount}\` Members` },
        {
          name: 'Creation Date',
          value: `\`${moment.utc(guild.createdAt).format('DD/MMM/YYYY')}\``
        },
        {
          name: 'Guild Invite',
          value: `[Here is ${guild.name} invite ](https://discord.gg/${invite.code})`
        },
        {
          name: `${client.user?.username}'s Server Count`,
          value: `\`${client.guilds.cache.size}\` Servers`
        }
      ])
      .setTimestamp()

    try {
      channel.send({ embeds: [embed] })
    } catch (e) {}

    const members = await guild.members.fetch()
    members.forEach(async member => {
      await vouchClient.profiles.register({
        id: member.id,
        username: member.user.username
      })
    })
  }
}
