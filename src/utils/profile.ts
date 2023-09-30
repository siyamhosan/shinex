import { Badges } from '@prisma/client'

export const BadgeEmojis: Record<Badges, string> = {
  EARLYSUPPORTER: '<:Early_ShineX:1157673614611583016>',
  MEMBER: ''
}

export function GetBadges (badges: Badges[]) {
  if (badges.length === 0) return 'No Badges'
  return badges.map(badge => BadgeEmojis[badge]).join('')
}
