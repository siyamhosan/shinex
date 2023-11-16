import chalk from 'chalk'
import { EventTypes, Vouch, VouchClient } from 'vouchapi'
import { CreatedVouch } from './utils/vouch.js'

const vouchClient = new VouchClient()

vouchClient.on('ready', () => {
  console.info('Vouch Client is ready', chalk.bold('VA'))
})

vouchClient.on(EventTypes.VouchCreated, ({ vouch }) => {
  CreatedVouch(new Vouch(vouch, vouchClient))
})

export default vouchClient
