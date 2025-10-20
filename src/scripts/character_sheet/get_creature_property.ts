import {ATTRIBUTE_CODES} from "scripts/character_sheet/attributes";
import type {Creature} from "scripts/battlegrid/creatures/Creature";
import type {AstNodeNumberResolved} from "scripts/expressions/token_evaluator/types";
import {get_creature_attribute_mod} from "scripts/character_sheet/get_creature_attribute_mod";
import {get_creature_half_level} from "scripts/character_sheet/get_creature_half_level";

const ATTRIBUTE_MOD_CODES = ATTRIBUTE_CODES.map(attribute => `${attribute}_mod`)
const ATTRIBUTE_MOD_CODES_LVL = ATTRIBUTE_CODES.map(attribute => `${attribute}_mod_lvl`)

export const get_creature_property = ({creature, property}: {
    creature: Creature,
    property: string
}): Omit<AstNodeNumberResolved, "type"> => {
    if (property === "movement")
        return {value: creature.data.movement, description: "movement"}

    if (property === "level")
        return {value: creature.data.level, description: "level"}

    if (ATTRIBUTE_MOD_CODES.includes(property))
        return get_creature_attribute_mod(creature, property.slice(0, 3) as any)

    if (ATTRIBUTE_MOD_CODES_LVL.includes(property)) {
        const parts = [
            get_creature_half_level(creature),
            get_creature_attribute_mod(creature, property.slice(0, 3) as any)
        ]
        return {
            value: parts.reduce((result, part) => part.value + result, 0),
            description: property,
            params: parts
        }
    }

    throw Error(`Invalid property ${property}`)
}
