import { Event } from 'dtscommands'
import client from '../../../index.js'
import chalk from 'chalk'
import { ActivityType } from 'discord.js'

export class ReadyEvent extends Event<'ready'> {
  constructor () {
    super({
      name: 'ready',
      once: true
    })
  }

  run () {
    console.info(`Client logged in as "${client.user?.tag}"`, chalk.bold('cli'))
    // bot.application?.commands.set(bot.commands.array)

    client.config.managers.push({
      guildId: '1157365694950809692',
      roleId: '1157579034562150482'
    })

    client.user?.setPresence({
      activities: [
        {
          name: 'シネックス',
          type: ActivityType.Playing
        }
      ],
      status: 'online'
    })
  }
}
