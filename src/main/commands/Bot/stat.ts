import { Command, CommandRun } from 'dtscommands'
import moment from 'moment'

export class BotStatusCmd extends Command {
  constructor () {
    super({
      name: 'stat',
      description: 'Get the status of the bot',
      category: 'bot'
    })
  }

  async run ({ message, args }: CommandRun) {
    const uptime = process.uptime()
    const formatted = moment
      .duration(uptime, 'seconds')
      .humanize()
      .replace('a few seconds', 'less than a minute')
      .replace(' minutes', 'm')
      .replace(' hours', 'h')
      .replace(' days', 'd')
      .replace(' weeks', 'w')
      .replace(' months', 'mo')
      .replace(' years', 'y')
  }
}
