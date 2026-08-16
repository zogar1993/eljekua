import type {Creature} from "core/battlegrid/creatures/Creature";
import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";

export const get_creature_attribute_mod = (creature: Creature, attribute: keyof Creature["data"]["attributes"]): ExprNumberResolved =>
    ({type: "number_resolved", value: creature.attribute_mod(attribute), description: `${attribute}_mod`})
