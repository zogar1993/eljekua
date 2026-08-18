import {Creature} from "core/battlegrid/creatures/Creature";
import {run_end_of_turn_hooks} from "core/battlegrid/player_turn_handler/run_end_of_turn_hooks";
import {run_start_of_turn_hooks} from "core/battlegrid/player_turn_handler/run_start_of_turn_hooks";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";
import type {GameEvents} from "core/events/GameEvents";
import type {GameState} from "core/game_state/GameState";


export const create_set_current_turn_to_creature = (
    {game_state, game_events}: {
        game_state: GameState
        game_events: GameEvents
    }
) => (
    {creature}: { creature: Creature }
) => {
    const {turn_state, initiative_order, battle_grid} = game_state
    run_end_of_turn_hooks({current_turn_creature: initiative_order.get_current_creature(), battle_grid})

    turn_state.clear()
    initiative_order.set_current_turn(creature)

    run_start_of_turn_hooks({
        current_turn_creature: initiative_order.get_current_creature(),
        battle_grid,
        game_events,
    })

    turn_state.add_instruction_frame({instructions: [{type: INSTRUCTION_TYPE.ADD_CURRENT_TURN_BASE_OPTIONS}]})
}