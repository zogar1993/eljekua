import {
    InterpretInstructionProps
} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {InstructionEndTurn} from "core/virtual_machine/instructions/instructions";
import {run_start_of_turn_hooks} from "core/battlegrid/player_turn_handler/run_start_of_turn_hooks";
import {run_end_of_turn_hooks} from "core/battlegrid/player_turn_handler/run_end_of_turn_hooks";

export const interpret_end_turn = ({
                                       battle_grid,
                                       initiative_order,
                                       game_events,
                                   }: InterpretInstructionProps<InstructionEndTurn>) => {
    run_end_of_turn_hooks({current_turn_creature: initiative_order.get_current_creature(), battle_grid})

    initiative_order.next_turn()

    run_start_of_turn_hooks({
        current_turn_creature: initiative_order.get_current_creature(),
        battle_grid,
        game_events,
    })
}