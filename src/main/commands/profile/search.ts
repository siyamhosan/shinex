import { Command, CommandRun } from 'dtscommands'
import vouchClient from '../../../vouchClient.js'
import { BotEmbed } from '../../../utils/Embeds.js'
import { del30, del9 } from '../../../utils/fun.js'

export class SearchProductCmd extends Command {
  constructor () {
    super({
      name: 'search',
      description: 'Search for a product',
      category: 'Profile',
      args: true,
      usage: '<product>'
    })
  }

  async run ({ message, args }: CommandRun) {
    const query = args.join(' ').trim()

    const products = await vouchClient.profiles.searchProduct(query)

    const embed = new BotEmbed()
    embed.setTitle('Search Results')

    if (!products?.length) {
      embed.setDescription('No products found')
      return message.channel.send({ embeds: [embed] }).then(del9)
    }

    const formatted = products
      .sort(
        (a, b) =>
          b.positiveVouches +
          b.importedVouches -
          a.positiveVouches -
          a.importedVouches
      )
      .map(product => {
        return `Seller: \`${product.username}\` - **${
          product.importedVouches + product.positiveVouches
        }** vouches,\n\`\`\`\n[${product.products}]\`\`\``
      })

    embed.setDescription(
      formatted.join('\n') +
        '\n\nIn Search of ' +
        query +
        ', we found some sellers'
    )

    message.reply({ embeds: [embed] }).then(del30)
  }
}
