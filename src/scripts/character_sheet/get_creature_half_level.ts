import type {Creature} from "scripts/battlegrid/creatures/Creature";
import type {ExprNumberResolved} from "scripts/expressions/evaluator/types";

export const get_creature_half_level = (creature: Creature): ExprNumberResolved =>
    ({type: "number_resolved", value: creature.half_level(), description: "half level"})
