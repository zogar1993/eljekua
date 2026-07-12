import {InitiativeOrder} from "scripts/initiative_order/InitiativeOrder";
import {BattleGrid} from "scripts/battlegrid/BattleGrid";

import {run_start_of_turn_hooks} from "scripts/battlegrid/player_turn_handler/run_start_of_turn_hooks";
import {PlayerTurnHandler} from "scripts/battlegrid/player_turn_handler/PlayerTurnHandler";


export const create_start_battle = (
    {initiative_order, battle_grid, player_turn_handler}: {
        initiative_order: InitiativeOrder,
        battle_grid: BattleGrid,
        player_turn_handler: PlayerTurnHandler
    }
) => () => {
    initiative_order.start()
    const creature = initiative_order.get_current_creature()
    run_start_of_turn_hooks({current_turn_creature: creature, battle_grid})
    player_turn_handler.evaluate_instructions()
}