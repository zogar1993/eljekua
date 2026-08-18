import {InitiativeOrder} from "core/initiative_order/InitiativeOrder";
import {BattleGrid} from "core/battlegrid/BattleGrid";

import {run_start_of_turn_hooks} from "core/battlegrid/player_turn_handler/run_start_of_turn_hooks";
import {InstructionLoop} from "core/instruction_loop";
import {TurnState} from "core/battlegrid/player_turn_handler/TurnState";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";
import type {GameEvents} from "core/events/GameEvents";


export const create_start_battle = (
    {initiative_order, battle_grid, instruction_loop, turn_state, game_events}: {
        initiative_order: InitiativeOrder,
        battle_grid: BattleGrid,
        instruction_loop: InstructionLoop
        turn_state: TurnState
        game_events: GameEvents
    }
) => () => {
    initiative_order.start()
    const creature = initiative_order.get_current_creature()
    run_start_of_turn_hooks({current_turn_creature: creature, battle_grid, game_events})
    turn_state.add_instruction_frame({instructions: [{type: INSTRUCTION_TYPE.ADD_CURRENT_TURN_BASE_OPTIONS}]})
    instruction_loop.run()
}