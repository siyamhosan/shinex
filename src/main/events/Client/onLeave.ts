import { Event } from 'dtscommands'
import client from '../../../index.js'
import { Colors, Guild, TextChannel } from 'discord.js'
import { BotEmbed } from '../../../utils/Embeds.js'
import moment from 'moment'
import { ON_LEAVE_CHANNEL_ID } from '../../../config.js'

export class OnLeaveEvent extends Event<'guildDelete'> {
  constructor () {
    super({
      name: 'guildDelete',
      nick: 'OnLeave'
    })
  }

  async run (guild: Guild) {
    const channel = client.channels.cache.get(
      ON_LEAVE_CHANNEL_ID
    ) as TextChannel
    const own = await guild?.fetchOwner()

    const embed = new BotEmbed()
      .setThumbnail(guild.iconURL({ forceStatic: false, size: 1024 }))
      .setTitle('📤 Left a Guild !!')
      .setColor(Colors.DarkRed)
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
          name: `${client.user?.username}'s Server Count`,
          value: `\`${client.guilds.cache.size}\` Servers`
        }
      ])
      .setTimestamp()
    channel?.send({ embeds: [embed] })
  }
}
