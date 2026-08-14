import {InitiativeOrder} from "core/initiative_order/InitiativeOrder";
import {Creature} from "core/battlegrid/creatures/Creature";
import {PlayerTurnHandler} from "core/battlegrid/player_turn_handler/PlayerTurnHandler";
import {run_end_of_turn_hooks} from "core/battlegrid/player_turn_handler/run_end_of_turn_hooks";
import {run_start_of_turn_hooks} from "core/battlegrid/player_turn_handler/run_start_of_turn_hooks";
import {BattleGrid} from "core/battlegrid/BattleGrid";
import {TurnState} from "core/battlegrid/player_turn_handler/TurnState";


export const create_set_current_turn_to_creature = (
    {turn_state, initiative_order, battle_grid, player_turn_handler}: {
        turn_state: TurnState
        initiative_order: InitiativeOrder
        battle_grid: BattleGrid
        player_turn_handler: PlayerTurnHandler
    }
) => (
    {creature}: { creature: Creature }
) => {
    run_end_of_turn_hooks({current_turn_creature: initiative_order.get_current_creature(), battle_grid})

    turn_state.clear()
    initiative_order.set_current_turn(creature)

    run_start_of_turn_hooks({current_turn_creature: initiative_order.get_current_creature(), battle_grid})

    player_turn_handler.set_action_selection_for_current_character()
}