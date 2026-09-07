import type {Creature} from "core/battlegrid/creatures/Creature";
import {get_creature_attribute_mod as resolve_creature_attribute_mod} from "core/battlegrid/creatures/Creature";
import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";

export const get_creature_attribute_mod = (creature: Creature, attribute: keyof Creature["data"]["attributes"]): ExprNumberResolved =>
    ({type: "number_resolved", value: resolve_creature_attribute_mod({creature, attribute_code: attribute}), description: `${attribute}_mod`})
