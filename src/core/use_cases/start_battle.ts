import {InitiativeOrder} from "core/initiative_order/InitiativeOrder";
import {BattleGrid} from "core/battlegrid/BattleGrid";

import {run_start_of_turn_hooks} from "core/battlegrid/player_turn_handler/run_start_of_turn_hooks";
import {InstructionLoop, setup_turn_base_frame} from "core/instruction_loop";
import {TurnState} from "core/battlegrid/player_turn_handler/TurnState";


export const create_start_battle = (
    {initiative_order, battle_grid, instruction_loop, turn_state}: {
        initiative_order: InitiativeOrder,
        battle_grid: BattleGrid,
        instruction_loop: InstructionLoop
        turn_state: TurnState
    }
) => () => {
    initiative_order.start()
    const creature = initiative_order.get_current_creature()
    run_start_of_turn_hooks({current_turn_creature: creature, battle_grid})
    setup_turn_base_frame(turn_state, creature)
    instruction_loop.run()
}