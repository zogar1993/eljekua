import type {Creature} from "scripts/battlegrid/creatures/Creature";
import type {ExprNumberResolved} from "scripts/expressions/token_evaluator/types";

export const get_creature_attribute_mod = (creature: Creature, attribute: keyof Creature["data"]["attributes"]): ExprNumberResolved =>
    ({type: "number_resolved", value: creature.attribute_mod(attribute), description: `${attribute}_mod`})
