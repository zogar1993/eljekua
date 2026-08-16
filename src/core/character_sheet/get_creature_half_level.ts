import type {Creature} from "core/battlegrid/creatures/Creature";
import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";

export const get_creature_half_level = (creature: Creature): ExprNumberResolved =>
    ({type: "number_resolved", value: creature.half_level(), description: "half level"})
