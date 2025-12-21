export const ACTION_TYPE = {
    STANDARD: "standard",
    MOVEMENT: "movement",
    MINOR: "minor",
    OPPORTUNITY: "opportunity",
    FREE: "free"
} as const

export type ActionType = typeof ACTION_TYPE[keyof typeof ACTION_TYPE]