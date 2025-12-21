export type HitStatus = typeof HIT_STATUS[keyof typeof HIT_STATUS]

export const HIT_STATUS = {
    NONE: "none",
    HIT: "hit",
    MISS: "miss",
} as const