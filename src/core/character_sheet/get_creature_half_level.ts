import type {Creature} from "core/battlegrid/creatures/Creature";
import {get_creature_half_level as resolve_creature_half_level} from "core/battlegrid/creatures/Creature";
import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";

export const get_creature_half_level = (creature: Creature): ExprNumberResolved =>
    ({type: "number_resolved", value: resolve_creature_half_level({creature}), description: "half level"})
