import { SlashCommandBuilder } from '@discordjs/builders'
import { Message, MessageEmbed } from 'discord.js'
import { getConfig } from '../database/models/config'
import { Command } from '../interfaces/command'
import { imageBufferFromUrl } from '../utils/images/image'
import { generateBnw } from '../utils/images/style-bnw'

export const quoteOnMentioned = async (message: Message) => {
  const profileImageBuffer = await imageBufferFromUrl(
    message.author.avatarURL()!
  )
  const generatedImage = await generateBnw(
    profileImageBuffer,
    message.content,
    message.author.tag
  )

  const serverConfig = await getConfig(message.guildId!)

  const channel = await message.guild?.channels.fetch(serverConfig.channelId!)
  if (channel?.isText()) {
    channel.send({ files: [generatedImage] })
  }
}

const generateEmbed = (message: Message) => {
  const embed = new MessageEmbed()
  embed.setDescription(message.content)
  embed.setAuthor({
    name: message.author.tag,
    iconURL: message.author.displayAvatarURL()
  })
  embed.setFooter({ text: `Created at ${message.createdAt.toDateString()}` })

  return embed
}

export const quote: Command = {
  data: new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Create quote from message id')
    .addStringOption((option) =>
      option
        .setName('message_id')
        .setDescription(
          'Desired message id. You might need developer mode for this'
        )
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName('this-channel')
        .setDescription('Send quote to this channel instead')
    )
    .addStringOption((option) =>
      option.setName('style').setDescription('Set quote styles').addChoices(
        {
          name: 'Black and white image',
          value: 'bnw'
        },
        {
          name: 'Message embed',
          value: 'embed'
        }
      )
    ),
  async run(interaction) {
    await interaction.deferReply()

    if (!interaction.channel) return
    const serverConfig = await getConfig(interaction.guildId!)

    const messageId = interaction.options.getString('message_id', true)
    const message = await interaction.channel.messages.fetch(messageId)

    const style = interaction.options.getString('style') || 'bnw'

    let result: {
      files?: Buffer[]
      embeds?: MessageEmbed[]
    }

    if (style === 'bnw') {
      const profileImageBuffer = await imageBufferFromUrl(
        message.author.avatarURL()!
      )
      const generatedImage = await generateBnw(
        profileImageBuffer,
        message.content,
        message.author.tag
      )

      result = { files: [generatedImage] }
    } else {
      result = { embeds: [generateEmbed(message)] }
    }

    if (
      serverConfig.sameChannel &&
      !interaction.options.getBoolean('this-channel')
    ) {
      const channel = await interaction.guild?.channels.fetch(
        serverConfig.channelId!
      )
      if (channel?.isText()) {
        channel.send(result)
      }
      await interaction.editReply('Done')
    } else {
      await interaction.editReply(result)
    }
  }
}
