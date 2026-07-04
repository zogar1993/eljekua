export type HitStatus = typeof HIT_STATUS[keyof typeof HIT_STATUS]

export const HIT_STATUS = {
    NONE: 0,
    HIT: 1,
    MISS: 2,
} as const
