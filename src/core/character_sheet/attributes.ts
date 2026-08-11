export const ATTRIBUTES = {
    STRENGTH: "str",
    CONSTITUTION: "con",
    DEXTERITY: "dex",
    INTELLIGENCE: "int",
    WISDOM: "wis",
    CHARISMA: "cha",
} as const

export const ATTRIBUTE_CODES = Object.values(ATTRIBUTES)

export type AttributeCode = typeof ATTRIBUTE_CODES[number]