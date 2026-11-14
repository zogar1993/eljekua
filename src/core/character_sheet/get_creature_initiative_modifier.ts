import {ATTRIBUTES} from "core/character_sheet/attributes";
import type {Creature} from "core/battlegrid/creatures/Creature";
import {get_creature_attribute_mod, get_creature_half_level} from "core/battlegrid/creatures/Creature";

export const get_creature_initiative_modifier = (creature: Creature): number => {
    if (creature.data.initiative_modifier !== null)
        return creature.data.initiative_modifier
    return get_creature_half_level({creature})
        + get_creature_attribute_mod({creature, attribute_code: ATTRIBUTES.DEXTERITY})
}