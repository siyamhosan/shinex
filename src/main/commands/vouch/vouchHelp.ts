import { Command, CommandRun } from 'dtscommands'
import { BotEmbed } from '../../../utils/Embeds.js'
import { Colors } from 'discord.js'

export class VouchHelp extends Command {
  constructor () {
    super({
      name: 'vouchhelp',
      description: 'Help users with vouching',
      category: 'Vouch',
      aliases: ['vouchh', 'vh'],
      args: true,
      usage: '<comment>'
    })
  }

  async run ({ message, args, client }: CommandRun) {
    const user = message.author

    const comment = args.join(' ')

    if (!comment) {
      return message.reply('Use Correctly `vh <user> <comment>`')
    }

    const embed = new BotEmbed({
      title: `Please vouch ${user.username}`,
      description: `Please vouch \`${user.username}\` with the comment \`${comment}\``,
      color: Colors.Orange,
      fields: [
        {
          name: 'Command',
          value: client.config.prefix + `vouch ${user.id} ${comment}`
        }
      ]
    })

    return message.channel.send({
      embeds: [embed]
    })
  }
}
