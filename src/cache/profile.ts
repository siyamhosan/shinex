import { Profile } from '@prisma/client'
import { Collection } from 'discord.js'
import prisma from '../prisma.js'

const CacheProfiles = new Collection<string, Profile>()

export async function CreateProfile ({
  userId,
  username
}: {
  userId: string
  username: string
}) {
  console.time('CreateProfile')
  const newProfile = await prisma.profile.create({
    data: {
      forum: 'Set your forum',
      products: 'Set your products',
      shop: 'Set your shop',
      userId,
      username,
      badges: ['EARLYSUPPORTER']
    }
  })
  console.timeEnd('CreateProfile')
  CacheProfiles.set(userId, newProfile)
  return newProfile
}

export async function GetProfile (userId: string, username: string) {
  const profile = CacheProfiles.get(userId)
  if (!profile) {
    console.time('GetProfile')
    const newProfile = await prisma.profile.findFirst({
      where: {
        userId
      }
    })
    console.timeEnd('GetProfile')
    if (!newProfile) {
      return CreateProfile({
        userId,
        username
      })
    }
    CacheProfiles.set(userId, newProfile)
    return newProfile
  }
  return profile
}

export async function UpdateProfile (userId: string, data: Partial<Profile>) {
  const profile = await prisma.profile.update({
    where: {
      userId
    },
    data
  })
  CacheProfiles.delete(userId)
  CacheProfiles.set(userId, profile)
  return profile
}

export default CacheProfiles
