import type {Size} from "core/battlegrid/creatures/SIZES";
import type {ConstantEffect} from "core/battlegrid/creatures/Creature";
import type {Modifier} from "core/battlegrid/creatures/Modifier";
import type {AttributeCode} from "core/character_sheet/attributes";
import type {DefenseCode} from "core/character_sheet/get_creature_defense";
import type {SkillCode} from "core/character_sheet/skills";
import type {IRPower} from "core/types";

export type Monster = {
    template: string
    size: Size
    race: string
    keywords: Array<string>
    level: number
    xp: number
    archetypes: Array<string>
    initiative: number
    senses: Record<string, number>
    alignment: string
    languages: Array<string>
    hp: number
    defenses: Record<DefenseCode, number>
    speed: number
    powers: Array<IRPower>
    attributes: Record<AttributeCode, number>
    skills?: Partial<Record<SkillCode, number>>
    constant_effects: Array<ConstantEffect>
    modifiers?: Array<Modifier>
}
