import chalk from 'chalk'
import { VouchClient } from 'vouchapi'

const vouchClient = new VouchClient()

vouchClient.on('ready', () => {
  console.info('Vouch Client is ready', chalk.bold('VA'))
})

export default vouchClient
