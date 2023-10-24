/* eslint-disable @typescript-eslint/ban-ts-comment */
import { exec } from 'child_process'
import 'dotenv/config.js'
import { Bot, CommandManager, Compiler, EventManager } from 'dtscommands'
import { writeFileSync } from 'fs'
import path from 'path'
import { Validations } from './utils/Validations.js'
import './vouchClient.js'

const bot = new Bot({
  commandsDir: path.join(process.cwd(), 'src', 'main', 'commands'),
  eventsDir: path.join(process.cwd(), 'src', 'main', 'events'),
  prefix: process.env.PREFIX || ',',
  uniCommandsDir: path.join(process.cwd(), 'src', 'main', 'uniCommands'),
  slashCommandsDir: path.join(process.cwd(), 'src', 'main', 'slashCommands'),
  mentionMessage: { content: 'My prefix is: `+`\nUse `+help` to get started!' },
  additionalPrefixes: process.env.DEV ? [] : ['-', ','],
  customValidations: Validations
})

main()

export default bot

const DynamicImport = async (path: string) =>
  await import(path).catch(console.error)

async function CompileManager (path: string, of: string) {
  await Compiler(path, of).then(async ({ exportedClasses, file }) => {
    writeFileSync(`./src/main/${of}/bundle/bundled.ts`, file)
    let done = false
    await exec(
      `eslint ./src/main/${of}/bundle/bundled.ts --fix --ext .ts --ext .js`,
      (err, stdout, stderr) => {
        if (err) {
          console.error(err)
          return
        }
        console.log(stdout)
        console.log(stderr)
        done = true
      }
    )
    while (!done) {
      await new Promise(resolve => setTimeout(resolve, 100))
      done = true
    }

    const allImports = await DynamicImport(`./main/${of}/bundle/bundled.js`)

    switch (of) {
      case 'events':
        EventManager(bot, exportedClasses, allImports)
        break
      case 'commands':
        CommandManager(bot, exportedClasses, allImports)
        break
      case 'slashCommands':
        // SlashManager(bot, exportedClasses, allImports)
        break
    }
  })
}

async function main () {
  await CompileManager(bot.config.eventsDir, 'events')
  await CompileManager(bot.config.commandsDir, 'commands')
  await CompileManager(bot.config.slashCommandsDir, 'slashCommands')

  await bot.login().then(() => {
    if (process.env.DEV) return
    const watchers = [
      'unhandledRejection',
      'uncaughtException',
      'uncaughtExceptionMonitor'
    ]
    watchers.forEach(str => {
      process.on(str, console.error)
    })
  })
}
