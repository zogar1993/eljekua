export const ATTACK_ROLL_RESOLUTION_MODE = {
    D20: "d20",
    HIT_STATUS: "hit_status",
    RIGGED_ROLL: "rigged_roll",
} as const

export type AttackRollResolutionMode = typeof ATTACK_ROLL_RESOLUTION_MODE[keyof typeof ATTACK_ROLL_RESOLUTION_MODE]
