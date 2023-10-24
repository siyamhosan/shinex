export type BadgeType =
  | 'EARLYSUPPORTER'
  | 'MEMBER'
  | 'APPEAL_STAFF'
  | 'REPORT_STAFF'
  | 'SHINEX_ADMIN'
  | 'SHINEX_STAFF'

export const Badges = [
  'EARLYSUPPORTER',
  'MEMBER',
  'APPEAL_STAFF',
  'REPORT_STAFF',
  'SHINEX_ADMIN',
  'SHINEX_STAFF'
]

export const BadgeEmojis: Record<BadgeType, string> = {
  EARLYSUPPORTER: '<:Early_ShineX:1157673614611583016> **Early Supporter**',
  MEMBER: '<:shinex2:1157695759622357052> **Member**',
  APPEAL_STAFF: '<:appeal_shinex_staff:1157677247914848267> **Appeal Staff**',
  REPORT_STAFF: '<:report_shinex_staff:1157677327019425892> **Report Staff**',
  SHINEX_ADMIN: '<:shinex_admin:1157681259938594866> **Shinex Admin**',
  SHINEX_STAFF: '<:shinex_staff:1157677399778021437> **Shinex Staff**'
}

export function GetBadges (badges: string[]) {
  if (badges.length === 0) return 'No Badges'
  const string = badges
    .map(badge => {
      return BadgeEmojis[badge as BadgeType]
    })
    .join('\n')

  if (string === '' || !string) return 'No Badges'
  return string
}
