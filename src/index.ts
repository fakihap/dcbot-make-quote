import { registerFont } from 'canvas'
import { Client, Intents } from 'discord.js'
import { connectDatabase } from './database/connect'
import { interactionCreate } from './events/interaction-create'
import { messageCreate } from './events/message-create'
import { onReady } from './events/on-ready'
import { validateEnv } from './utils/validate-env'
;(async () => {
  if (!validateEnv()) return
  registerFont('fonts/Roboto-Bold.ttf', {
    family: 'Roboto',
    weight: 'bold'
  })

  registerFont('fonts/Roboto-BoldItalic.ttf', {
    family: 'Roboto',
    weight: 'bold',
    style: 'italic'
  })

  registerFont('fonts/Roboto-Regular.ttf', {
    family: 'Roboto',
    weight: 'normal'
  })

  const bot = new Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.DIRECT_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ],
    partials: ['CHANNEL']
  })

  bot.on('ready', onReady)

  bot.on('interactionCreate', interactionCreate)

  bot.on('messageCreate', messageCreate)

  await connectDatabase()

  await bot.login(process.env.DISCORD_BOT_TOKEN)
})()
