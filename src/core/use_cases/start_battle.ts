import {InitiativeOrder} from "core/initiative_order/InitiativeOrder";
import {BattleGrid} from "core/battlegrid/BattleGrid";

import {run_start_of_turn_hooks} from "core/battlegrid/player_turn_handler/run_start_of_turn_hooks";
import {InstructionLoop} from "core/instruction_loop";


export const create_start_battle = (
    {initiative_order, battle_grid, instruction_loop}: {
        initiative_order: InitiativeOrder,
        battle_grid: BattleGrid,
        instruction_loop: InstructionLoop
    }
) => () => {
    initiative_order.start()
    const creature = initiative_order.get_current_creature()
    run_start_of_turn_hooks({current_turn_creature: creature, battle_grid})
    instruction_loop.run()
}