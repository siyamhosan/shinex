import { Command, CommandRun } from 'dtscommands'
import { ShinexRoles } from '../../../utils/Validations.js'

export class BlockProfileCmd extends Command {
  constructor () {
    super({
      name: 'block',
      description: 'Block a user from using the bot',
      category: 'Staff',
      args: true,
      usage: '<user> <reason>',
      validation: [ShinexRoles.ShinexAdminValidation]
    })
  }

  async run ({ message }: CommandRun) {
    message.reply('This command is not implemented yet')
  }
}
