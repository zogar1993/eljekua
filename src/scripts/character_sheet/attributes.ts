export const ATTRIBUTE_CODES = ["str", "con", "dex", "int", "wis", "cha"] as const

export type AttributeCode = typeof ATTRIBUTE_CODES[number]