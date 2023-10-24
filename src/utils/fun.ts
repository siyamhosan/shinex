/* eslint-disable @typescript-eslint/ban-ts-comment */
import chroma from 'chroma-js'
import { Message, User } from 'discord.js'
import GetColors from 'get-image-colors'
// import * as Vibrant from 'node-vibrant'

export const del5 = (msg: Message) => {
  setTimeout(() => {
    msg.delete()
  }, 5000)
}

export const del9 = (msg: Message) => {
  setTimeout(() => {
    msg.delete()
  }, 9000)
}

export const del25 = (msg: Message) => {
  setTimeout(() => {
    msg.delete()
  }, 25000)
}

export const del30 = (msg: Message) => {
  setTimeout(() => {
    msg.delete()
  }, 30000)
}

export const del60 = (msg: Message) => {
  setTimeout(() => {
    msg.delete()
  }, 60000)
}

export function IsLink (url: string) {
  return url.match(/(https?:\/\/[^\s]+)/g)
}

interface UserFromMessageOptions {
  authorAsDefault?: boolean
  authorFromMessageAsReply?: boolean
}

export async function UserFromMessage (
  message: Message,
  args: string[],
  { authorAsDefault, authorFromMessageAsReply }: UserFromMessageOptions = {
    authorAsDefault: false,
    authorFromMessageAsReply: false
  }
) {
  let user: User | null | undefined = null

  if (args[0] && args[0].startsWith('<@') && args[0].endsWith('>')) {
    user = await message.client?.users.fetch(
      args[0].replace('<@', '').replace('>', '')
    )
  } else if (args[0] && /\b\d+\b/.test(args[0])) {
    user = await message.client?.users.fetch(args[0])
  } else if (args[0]) {
    user = message.client.users.cache.find(
      u =>
        u.username.toLowerCase().includes(args[0].toLowerCase()) ||
        u.tag.toLowerCase().includes(args[0].toLowerCase()) ||
        u.displayName.toLowerCase().includes(args[0].toLowerCase())
    )
  } else if (
    authorFromMessageAsReply &&
    message.reference &&
    message.reference.messageId
  ) {
    const referencedMessage = await message.channel.messages.fetch(
      message.reference.messageId
    )
    user = referencedMessage.author
  } else if (authorAsDefault && !user) {
    user = message.author
  }
  return user
}

export function ExtractIdsAndReason (inputString: string): {
  ids: string[]
  reason: string | null
} {
  const numbersRegex = /\b\d+\b/g
  const reasonRegex = /(\b\d+\b\s+)+(.+)/

  const numbersMatches = inputString.match(numbersRegex)
  const reasonMatch = inputString.match(reasonRegex)

  const ids = numbersMatches ? numbersMatches.map(match => match) : []
  const reason = reasonMatch ? reasonMatch[2] : null

  return { ids, reason }
}

export async function ColorsFromImage (img: string) {
  let darkerColor
  let brighterColor
  await GetColors(img).then((colors: unknown[]) => {
    brighterColor = colors.sort(
      // @ts-ignore
      (a: unknown, b: unknown) => chroma(b).luminance() - chroma(a).luminance()
    )[0]
    darkerColor = colors.sort(
      // @ts-ignore
      (a, b) => chroma(a).luminance() - chroma(b).luminance()
    )[0]
  })
  // @ts-ignore
  return [brighterColor.hex(), darkerColor.hex()] as string[]
}

export function HexStringToInt (hex: string): number {
  return parseInt(hex.replace('#', ''), 16)
}

// async function mostUsedColor (imagePath: string) {
//   const palette = await Vibrant.from(imagePath).getPalette()

//   // Access the dominant color from the palette
//   const mostUsedRGBColor = palette.Vibrant?.hex

//   return HexStringToInt(mostUsedRGBColor || '#2D17F1')
// }
