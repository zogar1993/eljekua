export type HitStatus = typeof HIT_STATUS[keyof typeof HIT_STATUS]

export const HIT_STATUS = {
    MISS: 0,
    HIT: 1,
    CRIT: 2
} as const
