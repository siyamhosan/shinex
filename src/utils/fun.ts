import { Message } from 'discord.js'

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
