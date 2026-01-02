export const ACTION_TYPE = {
    STANDARD: "standard",
    MOVEMENT: "movement",
    MINOR: "minor",
    OPPORTUNITY: "opportunity",
    FREE: "free"
} as const

export const ACTION_TYPE_EXPENDITURE_ORDER = {
    [ACTION_TYPE.STANDARD]: [ACTION_TYPE.STANDARD],
    [ACTION_TYPE.MOVEMENT]: [ACTION_TYPE.MOVEMENT, ACTION_TYPE.STANDARD],
    [ACTION_TYPE.MINOR]: [ACTION_TYPE.MINOR, ACTION_TYPE.MOVEMENT, ACTION_TYPE.STANDARD],
    [ACTION_TYPE.OPPORTUNITY]: [ACTION_TYPE.OPPORTUNITY],
    [ACTION_TYPE.FREE]: [ACTION_TYPE.FREE]
} as const

export type ActionType = typeof ACTION_TYPE[keyof typeof ACTION_TYPE]

export const TURN_ACTION_TYPES = [ACTION_TYPE.MINOR, ACTION_TYPE.MOVEMENT, ACTION_TYPE.STANDARD] as const

export function assert_is_action_type(value: string): asserts value is ActionType {
    for (const action_type of Object.values(ACTION_TYPE))
        if (action_type === value) return
    throw Error(`"${value}" is not an action type`)
}