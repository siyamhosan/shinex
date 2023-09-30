import { Badges } from '@prisma/client'

export const BadgeEmojis: Record<Badges, string> = {
  EARLYSUPPORTER: '<:Early_ShineX:1157673614611583016> **Early Supporter**',
  MEMBER: '<:shinex2:1157695759622357052> **Member**',
  APPEAL_STAFF: '<:appeal_shinex_staff:1157677247914848267> **Appeal Staff**',
  REPORT_STAFF: '<:report_shinex_staff:1157677327019425892> **Report Staff**',
  SHINEX_ADMIN: '<:shinex_admin:1157681259938594866> **Shinex Admin**',
  SHINEX_STAFF: '<:shinex_staff:1157677399778021437> **Shinex Staff**'
}

export function GetBadges (badges: Badges[]) {
  if (badges.length === 0) return 'No Badges'
  return badges.map(badge => BadgeEmojis[badge]).join('\n')
}
