/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Vouchs, VouchStatus } from '@prisma/client'
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message,
  StringSelectMenuBuilder,
  TextChannel,
  User
} from 'discord.js'
import { UpdateProfile } from '../cache/profile.js'
import client from '../index.js'
import prisma from '../prisma.js'
import { VouchEmbed, VouchNotification } from './Embeds.js'
import {
  VOUCH_ACCEPTED_CHANNEL_ID,
  VOUCH_DENIED_CHANNEL_ID,
  VOUCH_LOG_CHANNEL_ID,
  VOUCH_PENDING_CHANNEL_ID,
  VOUCH_UNCHECKED_CHANNEL_ID
} from '../config.js'

export async function CreatedVouch (vouch: Vouchs) {
  const VOUCH_LOG_CHANNEL = client.channels.cache.get(
    VOUCH_LOG_CHANNEL_ID
  ) as TextChannel

  const embed = new VouchEmbed(vouch)

  const denySelectMenu = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`vouch:${vouch.id}:deny`)
      .setPlaceholder('Select a Deny reason')
      .setOptions(
        Object.entries(DenyReasons).map(([key, value]) => ({
          label: key,
          value: key,
          description: value.length < 50 ? value : value.slice(0, 50) + '...'
        }))
      )
  )
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder({
      customId: `vouch:${vouch.id}:accept`,
      label: 'Accept',
      style: ButtonStyle.Success
    }),
    new ButtonBuilder({
      customId: `vouch:${vouch.id}:proofreceiver`,
      label: 'Proof Receiver',
      style: ButtonStyle.Primary
    }),
    new ButtonBuilder({
      customId: `vouch:${vouch.id}:proofvoucher`,
      label: 'Proof Giver',
      style: ButtonStyle.Primary
    })
  )

  const message = await VOUCH_LOG_CHANNEL.send({
    embeds: [embed.setLog(true)]
  })

  const VOUCH_UNCHECKED_CHANNEL = client.channels.cache.get(
    VOUCH_UNCHECKED_CHANNEL_ID
  ) as TextChannel

  await VOUCH_UNCHECKED_CHANNEL.send({
    embeds: [embed.setControl(true)],
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    components: [row, denySelectMenu]
  })

  await prisma.vouchs.update({
    where: {
      id: vouch.id
    },
    data: {
      controllerMessageId: message.id
    }
  })
}

export async function UpdateController (vouch: Vouchs) {
  const VOUCH_LOG_CHANNEL = client.channels.cache.get(
    VOUCH_LOG_CHANNEL_ID
  ) as TextChannel

  const embed = new VouchEmbed(vouch)

  const message = await VOUCH_LOG_CHANNEL.messages.fetch(
    vouch.controllerMessageId ?? ''
  )
  if (!message) return

  await message.edit({
    embeds: [embed]
  })
}

export async function OnApprove (
  vouch: Vouchs,
  approver: User,
  message?: Message
) {
  const embed = new VouchNotification({
    description: `Your vouch with the id \`${vouch.id}\` has been approved`
  })

  ;(await client.users.fetch(vouch.receiverId))
    ?.send({
      embeds: [embed]
    })
    .catch(() => {
      console.log('Failed to send vouch notification to user')
    })

  const updatedVouch = await prisma.vouchs.update({
    where: {
      id: vouch.id
    },
    data: {
      vouchStatus: 'APPROVED',
      controlledBy: approver.id,
      controlledAt: new Date()
    }
  })

  await UpdateController(updatedVouch)

  UpdateProfile(updatedVouch.receiverId, {
    // @ts-ignore
    positiveVouches: {
      increment: 1
    },
    // @ts-ignore
    latestComments: {
      push: vouch.comment
    }
  })

  if (message) {
    await message.delete().catch(() => null)
  }

  const VOUCH_ACCEPTED_CHANNEL = client.channels.cache.get(
    VOUCH_ACCEPTED_CHANNEL_ID
  ) as TextChannel
  await VOUCH_ACCEPTED_CHANNEL.send({
    embeds: [new VouchEmbed(updatedVouch)]
  })
}

export async function OnDeny (
  vouch: Vouchs,
  denier: User,
  message?: Message,
  reason: string | null = null
) {
  const embed = new VouchNotification({
    description: `Your vouch with the id \`${
      vouch.id
    }\` has been denied for the reason \`${reason || DenyReasons.NONE}\``
  })

  ;(await client.users.fetch(vouch.receiverId))?.send({
    embeds: [embed]
  })

  const updatedVouch = await prisma.vouchs.update({
    where: {
      id: vouch.id
    },
    data: {
      vouchStatus: 'DENIED',
      deniedReason: reason || DenyReasons.NONE,
      controlledBy: denier.id,
      controlledAt: new Date()
    }
  })

  await UpdateController(updatedVouch)

  if (message) {
    await message.delete().catch(() => null)
  }

  const VOUCH_DENIED_CHANNEL = client.channels.cache.get(
    VOUCH_DENIED_CHANNEL_ID
  ) as TextChannel
  await VOUCH_DENIED_CHANNEL.send({
    embeds: [new VouchEmbed(updatedVouch)]
  })
}

export async function OnAskProof (
  vouch: Vouchs,
  asker: User,
  to: 'RECEIVER' | 'VOUCHER',
  message?: Message
) {
  const embed = new VouchNotification({
    description:
      to === 'RECEIVER'
        ? `The Vouch Id \`${vouch.id}\` Is Being **Asked Proof By Our Staffs**. To provide proof for your vouch with ID \`${vouch.id}\`, please visit our [Support Server](https://discord.gg/9XUdB2eK3m) > [Shinex Support](https://discord.com/channels/1157258354821971998/1160905771253506048). Our vouch policy requires vouches to be substantiated with proof. Failure to provide the necessary proof may result in **You being blacklisted or blocked**, as per our vouch policy.`
        : `**Thanks for your vouch for **\`${vouch.receiverName} ( ${vouch.receiverId} )\`. To make sure the trade  \`${vouch.comment}\` was legit/some good word.
        **The Vouch** \`${vouch.id}\` **is being asked for proof by our Staff**. To provide proof for your vouch with ID \`${vouch.id}\`, please visit our [Support Server](https://discord.gg/9XUdB2eK3m) > [Shinex Support](https://discord.com/channels/1157258354821971998/1160905771253506048). Our vouch policy requires vouches to be substantiated with proof. Failure to provide the necessary proof may result in **Seller being blacklisted or blocked**, as per our vouch policy.`
  })

  ;(
    await client.users.fetch(
      to === 'RECEIVER' ? vouch.receiverId : vouch.voucherId
    )
  )?.send({
    embeds: [embed]
  })

  const updatedVouch = await prisma.vouchs.update({
    where: {
      id: vouch.id
    },
    data: {
      vouchStatus: 'PENDING_PROOF',
      controlledBy: asker.id,
      controlledAt: new Date()
    }
  })

  await UpdateController(updatedVouch)

  if (message) {
    await message.delete().catch(() => null)
  }

  const VOUCH_PENDING_CHANNEL = client.channels.cache.get(
    VOUCH_PENDING_CHANNEL_ID
  ) as TextChannel

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder({
      customId: `vouch:${vouch.id}:accept`,
      label: 'Accept',
      style: ButtonStyle.Success
    }),
    new ButtonBuilder({
      customId: `vouch:${vouch.id}:deny`,
      label: 'Deny',
      style: ButtonStyle.Danger
    })
  )

  await VOUCH_PENDING_CHANNEL.send({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    components: updatedVouch.vouchStatus === 'PENDING_PROOF' ? [row] : [],
    embeds: [new VouchEmbed(updatedVouch)]
  })
}
export function VouchControl (
  vouch: Vouchs,
  { disableAccept, disableDeny, disableProofReceiver, disableProofVoucher } = {
    disableAccept: false,
    disableDeny: false,
    disableProofReceiver: false,
    disableProofVoucher: false
  },
  { needAccept, needDeny, needProofReceiver, needProofVoucher } = {
    needAccept: true,
    needDeny: false,
    needProofReceiver: true,
    needProofVoucher: true
  }
) {
  const row = new ActionRowBuilder()

  if (needAccept) {
    row.addComponents(
      new ButtonBuilder({
        customId: `vouch:${vouch.id}:accept`,
        label: 'Accept',
        style: ButtonStyle.Success,
        disabled: disableAccept
      })
    )
  }

  if (needDeny) {
    row.addComponents(
      new ButtonBuilder({
        customId: `vouch:${vouch.id}:deny`,
        label: 'Deny',
        style: ButtonStyle.Danger,
        disabled: disableDeny
      })
    )
  }

  if (needProofReceiver) {
    row.addComponents(
      new ButtonBuilder({
        customId: `vouch:${vouch.id}:proofreceiver`,
        label: 'Proof R',
        style: ButtonStyle.Primary,
        disabled: disableProofReceiver
      })
    )
  }

  if (needProofVoucher) {
    row.addComponents(
      new ButtonBuilder({
        customId: `vouch:${vouch.id}:proofvoucher`,
        label: 'Proof G',
        style: ButtonStyle.Primary,
        disabled: disableProofVoucher
      })
    )
  }

  return row
}

export const DenyReasons = {
  NONE: 'There is no Reason Provided Contact Shinex Support For More Info.',
  PRODUCT:
    'The Vouch Does Not Mention Or Unclear About The Product. Therefore It is denied.',
  TEST: 'The Vouch Here was Simply A Test Which is acceptable But Serve Fake Test Vouches Could lead to serve actions. Therefore Vouch Is denied',
  LOW: 'The Vouch  Does Not Matches With Our Current Monetary Value. kindly check Our vouch policy to know about our Monetary Value. Therefore It is denied',
  PRICE:
    "The vouch Here Doesn't Have A Clear Or Understandable Price. Remember Use Always The Real Country Code/Abbreviations For Money Value. Therefore Vouch Is Denied.",
  DETAILS:
    "The Vouch Here Doesn't Give Enough Details Or Isn't Intelligible, Provide all Details A Small Detail Mustn't Be Missed.\nSo Therefore, This vouch is denied.",
  SCAM: 'This Vouch Is Subject Of Scam Which Is handled by reports in shinex. Join our  Server To Get Them Reported. So Therefore, This vouch Denied',
  FRAUD:
    'Fraud = This Vouch Either Violates Discord Or Shinex Terms & Conditions Over Transaction. So therefore it is denied.',
  GRATIS:
    'The Free/Giveaway Item Here Was Not Intelligible Or Is against Our vouch policy. So Therefore, it is denied.',
  FUN: 'The Vouch Here Was Mere Troll Or Fun Textual Which is Acceptable At A Certain Level, Use the vouches as they are suppose to be. Multiple Troll Vouches Leads to Blacklist Or Server Consequences. So Therefore, The Vouch is denied.',
  DUPE: 'This appears to be a duplicate vouch. Please include all products you bought from the buyer in one vouch. Multiple vouches are considered duplicates, and hence will be denied.',
  BOT: "Shinex Currently Do Not Accept Any Vouch Where the Transaction Wasn't Filled in A Real Currency. So therefore, the vouch is denied.",
  ENGLISH:
    'The Vouch Must Contain English Sentences Only. Words From Other Languages Are Accepted But Not sentences. \nSo therefore, Vouch Is denied.'
}

export const VouchStatusMap: Record<VouchStatus, string> = {
  APPROVED: '✅`Approved`',
  DENIED: '❌`Denied`',
  PENDING_PROOF: '📝`Pending Proof`',
  UNCHECKED: '🔍`Unchecked`'
}

export const VouchStatusShortMap: Record<string, VouchStatus> = {
  PENDING: 'PENDING_PROOF',
  PROOF: 'PENDING_PROOF',
  APPROVE: 'APPROVED',
  APPROVED: 'APPROVED',
  DENY: 'DENIED',
  DENIED: 'DENIED',
  UNCHECKED: 'UNCHECKED',
  GOOD: 'APPROVED',
  BAD: 'DENIED',
  CHECK: 'UNCHECKED',
  TOCHECK: 'UNCHECKED',
  TOVERIFY: 'UNCHECKED',
  VERIFY: 'UNCHECKED',
  UNVERIFIED: 'UNCHECKED'
}
