import type {AttributeCode} from "core/character_sheet/attributes";

export const SKILLS = {
    ACROBATICS: "acrobatics",
    ARCANA: "arcana",
    ATHLETICS: "athletics",
    BLUFF: "bluff",
    DIPLOMACY: "diplomacy",
    DUNGEONEERING: "dungeoneering",
    ENDURANCE: "endurance",
    HEAL: "heal",
    HISTORY: "history",
    INSIGHT: "insight",
    INTIMIDATE: "intimidate",
    NATURE: "nature",
    PERCEPTION: "perception",
    RELIGION: "religion",
    STEALTH: "stealth",
    STREETWISE: "streetwise",
    THIEVERY: "thievery",
} as const

export const SKILL_CODES = Object.values(SKILLS)

export type SkillCode = typeof SKILL_CODES[number]

export const TRAINING_BONUS = 5

export const SKILL_ATTRIBUTE: Record<SkillCode, AttributeCode> = {
    acrobatics: "dex",
    arcana: "int",
    athletics: "str",
    bluff: "cha",
    diplomacy: "cha",
    dungeoneering: "wis",
    endurance: "con",
    heal: "wis",
    history: "int",
    insight: "wis",
    intimidate: "cha",
    nature: "wis",
    perception: "wis",
    religion: "int",
    stealth: "dex",
    streetwise: "cha",
    thievery: "dex",
}
