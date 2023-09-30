import { Badges } from '@prisma/client'

export const BadgeEmojis: Record<Badges, string> = {
  EARLYSUPPORTER: '<:Early_ShineX:1157673614611583016>',
  MEMBER: '<:shinex2:1157695759622357052>',
  APPEAL_STAFF: '<:appeal_shinex_staff:1157677247914848267>',
  REPORT_STAFF: '<:report_shinex_staff:1157677327019425892>',
  SHINEX_ADMIN: '<:shinex_admin:1157681259938594866>',
  SHINEX_STAFF: '<:shinex_staff:1157677399778021437>'
}

export function GetBadges (badges: Badges[]) {
  if (badges.length === 0) return 'No Badges'
  return badges.map(badge => BadgeEmojis[badge]).join('')
}
