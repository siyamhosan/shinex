import { CustomValidations } from 'dtscommands'
import * as Role from '../cache/role.js'
import { BotEmbed } from './Embeds.js'

export enum ShinexRoles {
  ShinexAdminValidation = 'ShinexAdminValidation',
  ShinexSeniorModValidation = 'ShinexSeniorModValidation',
  ShinexStaffValidation = 'ShinexStaffValidation'
}

const ShinexAdminValidation: CustomValidations = {
  name: ShinexRoles.ShinexAdminValidation,
  onFail: new BotEmbed({
    title: 'Shinex Admin Validation',
    description:
      'This command is limited to **Shinex Admins**.\nIf you want to participate in the Shinex Staff post, please get up to date in the Support Server.',
    color: 0xff274c
  }),
  validate ({ message, interaction }) {
    const user = message?.author ?? interaction?.user

    if (!user) return false

    if (Role.ShinexOwners.has(user.id) || Role.ShinexAdmins.has(user.id)) {
      return true
    }

    return false
  }
}

const ShinexSeniorModValidation: CustomValidations = {
  name: ShinexRoles.ShinexSeniorModValidation,
  onFail: new BotEmbed({
    title: 'Shinex Senior Validation',
    description:
      'This command is limited to **Shinex Seniors**.\nIf you want to participate in the Shinex Staff post, please get up to date in the Support Server.',
    color: 0xff274c
  }),
  validate ({ message, interaction }) {
    const user = message?.author ?? interaction?.user

    if (!user) return false

    if (
      Role.ShinexOwners.has(user.id) ||
      Role.ShinexAdmins.has(user.id) ||
      Role.ShinexSeniorMods.has(user.id)
    ) {
      return true
    }

    return false
  }
}

const ShinexStaffValidation: CustomValidations = {
  name: ShinexRoles.ShinexStaffValidation,
  onFail: new BotEmbed({
    title: 'Shinex Staff Validation',
    description:
      'This command is limited to **Shinex Staff**.\nIf you want to participate in the Shinex Staff post, please get up to date in the Support Server.',
    color: 0xff274c
  }),

  validate ({ message, interaction }) {
    const user = message?.author ?? interaction?.user

    if (!user) return false

    if (
      Role.ShinexOwners.has(user.id) ||
      Role.ShinexAdmins.has(user.id) ||
      Role.ShinexSeniorMods.has(user.id) ||
      Role.ShinexStaffs.has(user.id)
    ) {
      return true
    }

    return false
  }
}

export const isAnyStaff = (id: string) => {
  if (
    Role.ShinexOwners.has(id) ||
    Role.ShinexAdmins.has(id) ||
    Role.ShinexSeniorMods.has(id) ||
    Role.ShinexStaffs.has(id)
  ) {
    return true
  }

  return false
}

export const Validations = [
  ShinexAdminValidation,
  ShinexSeniorModValidation,
  ShinexStaffValidation
]
