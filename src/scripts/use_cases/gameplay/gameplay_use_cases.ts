
import {create_set_current_turn_to_creature} from "scripts/use_cases/gameplay/set_current_turn_to_creature";
import {create_move_creature} from "scripts/use_cases/gameplay/move_creature";
import {BattleGrid} from "scripts/battlegrid/BattleGrid";
import {InitiativeOrder} from "scripts/initiative_order/InitiativeOrder";
import {PlayerTurnHandler} from "scripts/battlegrid/player_turn_handler/PlayerTurnHandler";

export const create_gameplay_use_cases = (props: {
    battle_grid: BattleGrid,
    initiative_order: InitiativeOrder,
    player_turn_handler: PlayerTurnHandler,
}) => {
    return {
        move_creature: create_move_creature(props),
        set_current_turn_to_creature: create_set_current_turn_to_creature(props),
    }
}

export type GameplayUseCases = ReturnType<typeof create_gameplay_use_cases>;
