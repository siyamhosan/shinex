import { ButtonInteraction } from 'discord.js'
import { Event } from 'dtscommands'
import prisma from '../../../prisma.js'
import { OnApprove, OnAskProof, OnDeny } from '../../../utils/vouch.js'

export class VouchManager extends Event<'interactionCreate'> {
  constructor () {
    super({
      name: 'interactionCreate',
      nick: 'VouchManager'
    })
  }

  async run (interaction: ButtonInteraction) {
    if (!interaction.isButton()) return

    if (!interaction.customId.startsWith('vouch:')) return

    await interaction.deferUpdate()

    const vouch = await prisma.vouch.findUnique({
      where: {
        id: parseInt(interaction.customId.split(':')[1])
      }
    })

    if (!vouch) return

    switch (interaction.customId.split(':')[2]) {
      case 'accept':
        await OnApprove(vouch, interaction.user)
        break
      case 'deny':
        await OnDeny(vouch, interaction.user)
        break
      case 'proofreceiver':
        await OnAskProof(vouch, interaction.user, 'RECEIVER')
        break
      case 'proofvoucher':
        await OnAskProof(vouch, interaction.user, 'VOUCHER')
        break
    }
  }
}
