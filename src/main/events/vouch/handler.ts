/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ButtonInteraction, StringSelectMenuInteraction } from 'discord.js'
import { Event } from 'dtscommands'
import prisma from '../../../prisma.js'
import {
  OnApprove,
  OnAskProof,
  OnDeny,
  VouchControl
} from '../../../utils/vouch.js'

export class VouchManager extends Event<'interactionCreate'> {
  constructor () {
    super({
      name: 'interactionCreate',
      nick: 'VouchManager'
    })
  }

  async run (interaction: ButtonInteraction | StringSelectMenuInteraction) {
    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return

    if (!interaction.customId.startsWith('vouch:')) return

    await interaction.deferUpdate()

    const vouch = await prisma.vouch.findUnique({
      where: {
        id: parseInt(interaction.customId.split(':')[1])
      }
    })

    if (!vouch) return

    // disable the buttons in the message
    await interaction.message.edit({
      components: [
        // @ts-expect-error
        VouchControl(vouch, {
          disableAccept: interaction.customId.split(':')[2] === 'accept',
          disableDeny: interaction.customId.split(':')[2] === 'deny',
          disableProofReceiver:
            interaction.customId.split(':')[2] === 'proofreceiver',
          disableProofVoucher:
            interaction.customId.split(':')[2] === 'proofvoucher'
        }),
        ...interaction.message.components.filter(c => c.components.length === 1)
      ]
    })

    if (
      (vouch.receiverId === interaction.user.id ||
        vouch.voucherId === interaction.user.id) &&
      !process.env.DEV
    ) {
      return interaction.followUp({
        content: 'You can not control vouches related to you!',
        ephemeral: true
      })
    }

    switch (interaction.customId.split(':')[2]) {
      case 'accept':
        await OnApprove(vouch, interaction.user, interaction.message)
        break
      case 'deny':
        await OnDeny(
          vouch,
          interaction.user,
          interaction.message,
          interaction instanceof StringSelectMenuInteraction &&
            interaction.values[0]
            ? interaction.values[0]
            : undefined
        )
        break
      case 'proofreceiver':
        await OnAskProof(
          vouch,
          interaction.user,
          'RECEIVER',
          interaction.message
        )
        break
      case 'proofvoucher':
        await OnAskProof(
          vouch,
          interaction.user,
          'VOUCHER',
          interaction.message
        )
        break
    }
  }
}
