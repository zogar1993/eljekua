import type {AttributeCode} from "core/character_sheet/attributes";
import type {Creature} from "core/battlegrid/creatures/Creature";
import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import {get_creature_attribute_mod} from "core/character_sheet/get_creature_attribute_mod";
import {get_creature_half_level} from "core/character_sheet/get_creature_half_level";

export const get_creature_attribute_mod_lvl = (creature: Creature, attribute: AttributeCode): ExprNumberResolved => {
    const parts = [
        get_creature_half_level(creature),
        get_creature_attribute_mod(creature, attribute),
    ]
    return {
        type: "number_resolved",
        value: parts.reduce((result, part) => part.value + result, 0),
        description: `${attribute}_mod_lvl`,
        params: parts,
    }
}
