import { resolve } from 'node:path'
import sharp from 'sharp'
import { _projectPath } from '../get-cwd'
import { generateText } from './generate-text'

const imagePath = resolve(_projectPath, 'images/bnw/template.png')

export const generateBnw = async (profilePicture: Buffer, text: string, author?:string) => {
  const textCanvas = generateText(700, 400, text, author)

  const background = sharp(imagePath)
  const backgroundMetric = await background.metadata()
  const waifu = sharp(profilePicture).resize({ height: backgroundMetric.height })

  return await sharp({
    create: {
      width: backgroundMetric.width!,
      height: backgroundMetric.height!,
      channels: 4,
      background: '#FFFFFF'
    }
  }).composite([
    {
      input: await waifu.grayscale().toBuffer(),
      top: 0,
      left: 0
    },
    {
      input: await background.toBuffer()
    },
    {
      input: textCanvas.toBuffer(),
      top: Math.ceil((backgroundMetric.height! - textCanvas.height) / 2),
      left: 400 + Math.ceil((backgroundMetric.width! - textCanvas.width - 400) / 2)
    }
  ]).toBuffer()
}
