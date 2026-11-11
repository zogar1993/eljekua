import {assert_is_included} from "stdlib/assert";

export const ACTION_TYPE = {
    STANDARD: "standard",
    MOVEMENT: "movement",
    MINOR: "minor",
    IMMEDIATE: "immediate", // Once per round, someone else's turn, interrupt/reaction
    OPPORTUNITY: "opportunity", // Once per turn, someone else's turn, interrupt
    FREE_ATTACK: "free_attack", // Once per turn
    FREE: "free"
} as const

export const ACTION_TYPE_EXPENDITURE_ORDER = {
    [ACTION_TYPE.STANDARD]: [ACTION_TYPE.STANDARD],
    [ACTION_TYPE.MOVEMENT]: [ACTION_TYPE.MOVEMENT, ACTION_TYPE.STANDARD],
    [ACTION_TYPE.MINOR]: [ACTION_TYPE.MINOR, ACTION_TYPE.MOVEMENT, ACTION_TYPE.STANDARD],
    [ACTION_TYPE.IMMEDIATE]: [ACTION_TYPE.IMMEDIATE],
    [ACTION_TYPE.OPPORTUNITY]: [ACTION_TYPE.OPPORTUNITY],
    [ACTION_TYPE.FREE_ATTACK]: [ACTION_TYPE.FREE_ATTACK],
    [ACTION_TYPE.FREE]: [ACTION_TYPE.FREE]
} as const

export type ActionType = typeof ACTION_TYPE[keyof typeof ACTION_TYPE]

const ACTION_TYPES: Array<ActionType> = Object.values(ACTION_TYPE)

export function assert_is_action_type(value: string): asserts value is ActionType {
    assert_is_included(value, ACTION_TYPES)
}

export const TURN_ACTION_TYPES: Array<ActionType> = [
    ACTION_TYPE.MINOR,
    ACTION_TYPE.MOVEMENT,
    ACTION_TYPE.STANDARD
]