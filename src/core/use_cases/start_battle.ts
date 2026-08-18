import {run_start_of_turn_hooks} from "core/battlegrid/player_turn_handler/run_start_of_turn_hooks";
import {InstructionLoop} from "core/instruction_loop";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";
import type {GameEvents} from "core/events/GameEvents";
import type {GameState} from "core/game_state/GameState";


export const create_start_battle = (
    {game_state, instruction_loop, game_events}: {
        game_state: GameState
        instruction_loop: InstructionLoop
        game_events: GameEvents
    }
) => () => {
    const {initiative_order, battle_grid, turn_state} = game_state
    initiative_order.start()
    const creature = initiative_order.get_current_creature()
    run_start_of_turn_hooks({current_turn_creature: creature, battle_grid, game_events})
    turn_state.add_instruction_frame({instructions: [{type: INSTRUCTION_TYPE.ADD_CURRENT_TURN_BASE_OPTIONS}]})
    instruction_loop.run()
}