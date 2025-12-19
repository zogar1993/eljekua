type HitStatus = typeof HIT_STATUS[keyof typeof HIT_STATUS]

const HIT_STATUS = {
    NONE: "none",
    HIT: "hit",
    MISS: "miss",
} as const