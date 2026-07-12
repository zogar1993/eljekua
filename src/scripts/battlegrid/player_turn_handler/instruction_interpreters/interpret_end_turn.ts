import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {InstructionEndTurn} from "scripts/expressions/parser/instructions";
import {
    run_start_of_turn_hooks
} from "scripts/battlegrid/player_turn_handler/run_start_of_turn_hooks";
import {run_end_of_turn_hooks} from "scripts/battlegrid/player_turn_handler/run_end_of_turn_hooks";

export const interpret_end_turn = ({
                                       battle_grid,
                                       initiative_order,
                                   }: InterpretInstructionProps<InstructionEndTurn>) => {
    run_end_of_turn_hooks({current_turn_creature: initiative_order.get_current_creature(), battle_grid})

    initiative_order.next_turn()

    run_start_of_turn_hooks({current_turn_creature: initiative_order.get_current_creature(), battle_grid})
}