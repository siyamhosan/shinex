import { Profile, Vouch } from '@prisma/client'
import { APIEmbed, Colors, EmbedBuilder, EmbedData, User } from 'discord.js'
import { IsLink } from './fun.js'
import { GetBadges } from './profile.js'

export class BotEmbed extends EmbedBuilder {
  constructor (data?: EmbedData | APIEmbed) {
    super(data)
    this.setFooter({
      text: 'Shinex | Vouching System. discord.gg/tnt2NYgUBB'
    })
    this.setTimestamp(new Date())
  }
}

export function ProfileEmbed (profile: Profile, user: User) {
  const embed = new BotEmbed()

  embed.setTitle(`${user.displayName}'s Profile`)

  if (
    profile.profileStatus === 'SCAMMER' &&
    profile.markedFor &&
    profile.markedAt
  ) {
    embed.setColor(Colors.Red)
    embed.setDescription(
      `**${user.username}(${user.id}) is a scammer!**\n**Marked:** ${
        profile.markedFor
      }\n**Marked At:** <t:${Math.floor(profile.markedAt?.getTime() / 1000)}:D>`
    )
    embed.setThumbnail(user.displayAvatarURL())
    embed.setFooter({
      text: `Marked by ${profile.markedByUser} | Shinex. discord.gg/tnt2NYgUBB`
    })

    return embed
  }

  embed.setDescription(
    `${
      profile.waringReason && profile.profileStatus === 'WARN'
        ? `${profile.waringReason}\n`
        : ''
    }**ID:** ${user.id}\n**Age:**<t:${Math.floor(
      user.createdAt.getTime() / 1000
    )}:D>\n**Display Name:** ${user.displayName}\n**Mention:** <@${user.id}>`
  )

  embed.setFields(
    {
      name: '__Vouch Information__',
      value: `**Positive:** ${profile.positiveVouches}\n**Import:**: ${
        profile.importedVouches
      }\n**Overall:** ${profile.positiveVouches + profile.importedVouches}`
    },
    {
      name: '__Badges__',
      value: GetBadges(profile.badges)
    },
    {
      name: '__Products and Services__',
      value: `**Shop:**: ${profile.shop}\n**Forum:** ${profile.forum}\n**Products:** ${profile.products}`
    },
    {
      name: '__Last 5 Comments__',
      value:
        profile.latestComments
          .slice(0, 5)
          .map((comment, i) => `**${i + 1})** ${comment}`)
          .join('\n') || 'No comments'
    }
  )

  if (profile.color) {
    embed.setColor(profile.color)
  } else {
    // TODO: Get Brightest Color from avatar and set it as embed color
    embed.setColor(0x1b03a3)
  }

  embed.setThumbnail(user.displayAvatarURL())

  if (profile.banner && profile.banner !== '' && IsLink(profile.banner)) {
    embed.setImage(profile.banner)
  }

  return embed
}

export function VouchEmbed (vouch: Vouch) {
  const embed = new BotEmbed({
    title: 'Vouch Id: ' + vouch.id,
    description: `**Status:** \`${
      vouch.vouchStatus
    }\`\nVouched At: <t:${Math.floor(vouch.createdAt.getTime() / 1000)}:f>`,
    fields: [
      {
        name: '__Recipient Info__',
        value: `**Username:**${vouch.receiverName}\n**Id:**${vouch.receiverId}`
      },
      {
        name: '__Giver Info__',
        value: `**Username:**${vouch.voucherName}\n**Id:**${vouch.voucherId}`
      },
      {
        name: '__Server Info__',
        value: `**Name:**${vouch.serverName}\n**Id:**${vouch.serverId}`
      },
      {
        name: '__Comment__',
        value: vouch.comment ?? 'No Comment'
      }
    ]
  })

  if (vouch.vouchStatus === 'APPROVED') embed.setColor(Colors.Green)
  else if (vouch.vouchStatus === 'DENIED') embed.setColor(Colors.Red)
  else if (vouch.vouchStatus === 'PENDING_PROOF') embed.setColor(Colors.Yellow)
  else embed.setColor(0x1b03a3)

  if (vouch.controlledBy && vouch.controlledAt) {
    embed.addFields({
      name: '__Controlled By__',
      value: `**Mention:** <@${vouch.controlledBy}>\n**At:** <t:${Math.floor(
        vouch.controlledAt.getTime() / 1000
      )}:f>`
    })
  }

  if (vouch.vouchStatus === 'DENIED') {
    embed.addFields({
      name: '__Deny Reason__',
      value: `**Reason:** ${vouch.deniedReason}`
    })
  }

  return embed
}

export class VouchNotification extends BotEmbed {
  constructor (data?: EmbedData | APIEmbed) {
    super(data)
    this.setTitle('Vouch Notification System')
    this.setColor(0x1b03a3)
  }
}
