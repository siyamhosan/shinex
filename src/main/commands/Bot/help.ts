import { Command, CommandRun } from 'dtscommands'
import { BotEmbed } from '../../../utils/Embeds.js'
import { Colors } from 'discord.js'
import { del60 } from '../../../utils/fun.js'

export class HelpCmd extends Command {
  constructor () {
    super({
      category: 'Bot',
      description: 'Get the list of commands',
      name: 'help',
      aliases: ['commands']
    })
  }

  async run ({ message, client, args }: CommandRun) {
    const embed = new BotEmbed()

    const commands = client.commands

    if (args[0] && commands.get(args[0].toLowerCase())) {
      const command = commands.get(args[0].toLowerCase()) as Command
      embed.setTitle(command.name + ' | Help')
      embed.setDescription(command.description)
      embed.addFields(
        {
          name: 'Usage',
          value:
            '`' +
            client.config.prefix +
            command.name +
            ' ' +
            command.usage +
            '`'
        },
        {
          name: 'Aliases',
          value: command.aliases?.join(', ') || 'None'
        }
      )
      embed.setColor(0x1b03a3)

      return message.channel
        .send({
          embeds: [embed]
        })
        .then(del60)
    }

    const categories: { [key: string]: Command[] } = {}

    commands.forEach(command => {
      if (command.category === 'Staff') return
      if (!categories[command.category]) {
        categories[command.category] = []
      }
      categories[command.category].push(command)
    })

    embed.setTitle('Commands')
    embed.setDescription(
      'Here is a list of all the commands you can use on the bot.'
    )
    embed.addFields(
      Object.keys(categories).map(category => {
        return {
          name: category,
          value: categories[category]
            .map(
              command =>
                `**${client.config.prefix}${command.name}** ${command.description}`
            )
            .join('\n')
        }
      })
    )
    embed.setColor(0x1b03a3)
    embed.setThumbnail(client.user?.displayAvatarURL() || '')

    await message.channel
      .send({
        embeds: [embed]
      })
      .then(del60)
  }
}
