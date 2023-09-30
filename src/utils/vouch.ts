/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Vouch } from '@prisma/client'
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextChannel,
  User
} from 'discord.js'
import { UpdateProfile } from '../cache/profile.js'
import client from '../index.js'
import prisma from '../prisma.js'
import { VouchEmbed, VouchNotification } from './Embeds.js'

export async function CreatedVouch (vouch: Vouch) {
  const channel = client.channels.cache.get(
    process.env.VOUCHES_CHANNEL || ''
  ) as TextChannel
  if (!channel) return

  const embed = VouchEmbed(vouch)

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

  const message = await channel.send({
    embeds: [embed],
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    components: [row]
  })

  await prisma.vouch.update({
    where: {
      id: vouch.id
    },
    data: {
      controllerMessageId: message.id
    }
  })
}

export async function UpdateController (vouch: Vouch) {
  const channel = client.channels.cache.get(
    process.env.VOUCHES_CHANNEL || ''
  ) as TextChannel
  if (!channel) return

  const embed = VouchEmbed(vouch)

  const message = await channel.messages.fetch(vouch.controllerMessageId ?? '')
  if (!message) return

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

  await message.edit({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    components: vouch.vouchStatus === 'PENDING_PROOF' ? [row] : [],
    embeds: [embed]
  })
}

export async function OnApprove (vouch: Vouch, approver: User) {
  const embed = new VouchNotification({
    description: `Your vouch with the id \`${vouch.id}\` has been approved`
  })

  ;(await client.users.fetch(vouch.receiverId))?.send({
    embeds: [embed]
  })

  const updatedVouch = await prisma.vouch.update({
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
}

export async function OnDeny (
  vouch: Vouch,
  denier: User,
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

  const updatedVouch = await prisma.vouch.update({
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
}

export async function OnAskProof (
  vouch: Vouch,
  asker: User,
  to: 'RECEIVER' | 'VOUCHER'
) {
  const embed = new VouchNotification({
    description: `Your vouch with the id \`${vouch.id}\` has been asked for proof`
  })

  ;(
    await client.users.fetch(
      to === 'RECEIVER' ? vouch.receiverId : vouch.voucherId
    )
  )?.send({
    embeds: [embed]
  })

  const updatedVouch = await prisma.vouch.update({
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
    "The Vouch Here Doesn't Give Enough Details Or Isn't Intelligible, Provide all Details A Small Detail Mustn't Be Missed. So Therefore, This vouch is denied.",
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
