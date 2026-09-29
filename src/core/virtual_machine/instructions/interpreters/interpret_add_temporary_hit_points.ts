import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {resolve_number} from "core/virtual_machine/expressions/number_utils";
import type {InstructionAddTemporaryHitPoints} from "core/virtual_machine/instructions/instructions";
import {grant_creature_temporary_hit_points} from "core/battlegrid/creatures/temporary_hit_points";

export const interpret_add_temporary_hit_points = ({
                                                       instruction,
                                                       game_state,
                                                       game_queries,
                                                       game_events,
                                                   }: InterpretInstructionProps<InstructionAddTemporaryHitPoints>) => {
    const {vm_state} = game_state
    const target = EXPR.as_creature(vm_state.get_variable(instruction.target))
    const amount = resolve_number(EXPR.as_number_expr(game_queries.evaluate(instruction.value)))

    grant_creature_temporary_hit_points({creature: target, amount: amount.value})

    game_events.on_creature_temporary_hit_points_changed.raise({
        creature: target,
        temporary_hit_points: target.temporary_hit_points,
    })
}
