import type {Creature} from "core/battlegrid/creatures/Creature";
import {run_end_of_turn_hooks} from "core/turns/run_end_of_turn_hooks";
import {run_start_of_turn_hooks} from "core/turns/run_start_of_turn_hooks";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";
import type {GameEvents} from "core/events/GameEvents";
import type {GameState} from "core/game_state/GameState";


export const create_set_current_turn_to_creature = ({game_state, game_events}: {
    game_state: GameState
    game_events: GameEvents
}) => ({creature}: { creature: Creature }) => {
    const {vm_state, initiative_order} = game_state

    run_end_of_turn_hooks({game_state})

    vm_state.clear()
    initiative_order.set_current_turn(creature)

    run_start_of_turn_hooks({game_state, game_events})

    //TODO this is not good as it gets out of sync with start battle
    vm_state.add_instruction_frame({instructions: [{type: INSTRUCTION_TYPE.ADD_CURRENT_TURN_BASE_OPTIONS}]})
}