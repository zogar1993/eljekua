import {InitiativeOrder} from "scripts/initiative_order/InitiativeOrder";
import {Creature} from "scripts/battlegrid/creatures/Creature";
import {PlayerTurnHandler} from "scripts/battlegrid/player_turn_handler/PlayerTurnHandler";
import {run_end_of_turn_hooks} from "scripts/battlegrid/player_turn_handler/run_end_of_turn_hooks";
import {run_start_of_turn_hooks} from "scripts/battlegrid/player_turn_handler/run_start_of_turn_hooks";
import {BattleGrid} from "scripts/battlegrid/BattleGrid";


export const create_set_current_turn_to_creature = (
    {player_turn_handler, initiative_order, battle_grid}: {
        player_turn_handler: PlayerTurnHandler,
        initiative_order: InitiativeOrder,
        battle_grid: BattleGrid
    }
) => (
    {creature}: { creature: Creature }
) => {
    run_end_of_turn_hooks({current_turn_creature: initiative_order.get_current_creature(), battle_grid})

    player_turn_handler.clear_turn_state()
    initiative_order.set_current_turn(creature)

    run_start_of_turn_hooks({current_turn_creature: initiative_order.get_current_creature(), battle_grid})

    player_turn_handler.set_action_selection_for_current_character()
}