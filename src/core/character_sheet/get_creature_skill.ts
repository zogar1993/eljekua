import type {Creature} from "core/battlegrid/creatures/Creature";
import {get_creature_attribute_mod} from "core/character_sheet/get_creature_attribute_mod";
import {get_creature_half_level} from "core/character_sheet/get_creature_half_level";
import type {SkillCode} from "core/character_sheet/skills";
import {SKILL_ATTRIBUTE, TRAINING_BONUS} from "core/character_sheet/skills";
import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";

export const get_creature_skill = ({creature, skill_code}: {
    creature: Creature,
    skill_code: SkillCode
}): ExprNumberResolved => {
    const explicit_value = creature.data.skills[skill_code]
    if (explicit_value !== undefined) {
        return {
            type: "number_resolved",
            value: explicit_value,
            description: skill_code,
        }
    }

    const parts: Array<ExprNumberResolved> = [
        get_creature_half_level(creature),
        get_creature_attribute_mod(creature, SKILL_ATTRIBUTE[skill_code]),
    ]

    if (creature.data.trained_skills.includes(skill_code)) {
        parts.push({
            type: "number_resolved",
            value: TRAINING_BONUS,
            description: "training",
        })
    }

    return {
        type: "number_resolved",
        value: parts.reduce((result, part) => part.value + result, 0),
        params: parts,
        description: skill_code,
    }
}
