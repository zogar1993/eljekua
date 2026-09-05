import {run_start_of_turn_hooks} from "core/turns/run_start_of_turn_hooks";
import type {InstructionLoop} from "core/instruction_loop";
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
    const {initiative_order, vm_state} = game_state

    initiative_order.start()

    run_start_of_turn_hooks({game_state, game_events})
    const frame = {instructions: [ADD_CURRENT_TURN_BASE_OPTIONS, JUMP_TO_START], variables: {}}
    vm_state.add_scoped_instruction_frame(frame)
    instruction_loop.run()
}

const ADD_CURRENT_TURN_BASE_OPTIONS = {
    type: INSTRUCTION_TYPE.ADD_CURRENT_TURN_BASE_OPTIONS
} as const

const JUMP_TO_START = {
    type: INSTRUCTION_TYPE.JUMP,
    offset: -1
} as const