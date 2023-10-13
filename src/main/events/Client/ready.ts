import { Event } from 'dtscommands'
import client from '../../../index.js'
import chalk from 'chalk'
import { ActivityType } from 'discord.js'
import { VouchStaffs } from '../../../cache/role.js'

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
    const vouchStuffRole = guild?.roles.cache.get('1157579034562150482')

    vouchStuffRole?.members.forEach(member => {
      VouchStaffs.add(member.id)
    })
  }
}
