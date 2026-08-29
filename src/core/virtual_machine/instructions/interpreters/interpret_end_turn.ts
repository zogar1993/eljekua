import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import type {InstructionEndTurn} from "core/virtual_machine/instructions/instructions";
import {run_start_of_turn_hooks} from "core/turns/run_start_of_turn_hooks";
import {run_end_of_turn_hooks} from "core/turns/run_end_of_turn_hooks";

export const interpret_end_turn = ({
                                       game_state,
                                       game_events,
                                   }: InterpretInstructionProps<InstructionEndTurn>) => {
    const {initiative_order} = game_state

    run_end_of_turn_hooks({game_state})

    initiative_order.next_turn()

    run_start_of_turn_hooks({game_state, game_events})
}