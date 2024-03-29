import { Command, CommandRun } from 'dtscommands'
import { BotEmbed } from '../../../utils/Embeds.js'

export class InviteCmd extends Command {
  constructor () {
    super({
      name: 'invite',
      description: 'Invite the bot to your server',
      category: 'Bot'
    })
  }

  async run ({ message }: CommandRun) {
    const embed = new BotEmbed({
      title: 'Invite Me | ' + message.client.user.username,
      description: `[Shinex](https://discord.com/api/oauth2/authorize?client_id=${message.client.user.id}&permissions=412317149184&scope=bot%20applications.commands)\n[Shinex Support](https://discord.gg/9ZhRGmXcJK)`,
      color: 0x1b03a3
    })

    message.channel.send({
      embeds: [embed]
    })
  }
}
