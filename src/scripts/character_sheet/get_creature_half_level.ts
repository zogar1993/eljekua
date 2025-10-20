import type {Creature} from "scripts/battlegrid/creatures/Creature";
import type {AstNodeNumberResolved} from "scripts/expressions/token_evaluator/types";

export const get_creature_half_level = (creature: Creature): AstNodeNumberResolved =>
    ({type: "number_resolved", value: creature.half_level(), description: "half level"})
