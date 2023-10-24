import { Event } from 'dtscommands'
import client from '../../../index.js'
import chalk from 'chalk'
import { ActivityType } from 'discord.js'
import * as Role from '../../../cache/role.js'
import { ShinexRoles } from '../../../utils/Validations.js'

export class ReadyEvent extends Event<'ready'> {
  constructor () {
    super({
      name: 'ready',
      once: true
    })
  }

  async run () {
    console.info(`Client logged in as "${client.user?.tag}"`, chalk.bold('cli'))
    client.user?.setPresence({
      activities: [
        {
          name: 'シネックス | +help',
          type: ActivityType.Streaming
        }
      ],
      status: 'online'
    })

    const guild = client.guilds.cache.get('1157365694950809692')
    await guild?.members.fetch()

    const roleMap: Record<ShinexRoles, string> = {
      ShinexAdminValidation: '1157680973882871878',
      ShinexSeniorModValidation: '1166348577996541952',
      ShinexStaffValidation: '1157579034562150482'
    }

    const AdminRole = await guild?.roles.fetch(roleMap.ShinexAdminValidation)
    const SeniorModRole = await guild?.roles.fetch(
      roleMap.ShinexSeniorModValidation
    )
    const StaffRole = await guild?.roles.fetch(roleMap.ShinexStaffValidation)

    AdminRole?.members.forEach(member => {
      Role.ShinexAdmins.add(member.id)
    })

    SeniorModRole?.members.forEach(member => {
      Role.ShinexSeniorMods.add(member.id)
    })

    StaffRole?.members.forEach(member => {
      Role.ShinexStaffs.add(member.id)
    })
  }
}
