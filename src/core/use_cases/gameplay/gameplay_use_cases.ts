import {create_set_current_turn_to_creature} from "core/use_cases/gameplay/set_current_turn_to_creature";
import {BattleGrid} from "core/battlegrid/BattleGrid";
import {InitiativeOrder} from "core/initiative_order/InitiativeOrder";
import {TurnState} from "core/battlegrid/player_turn_handler/TurnState";
import {PlayerTurnHandler} from "core/instruction_loop";
import type {GameEvents} from "core/events/GameEvents";

export const create_gameplay_use_cases = (props: {
    battle_grid: BattleGrid,
    initiative_order: InitiativeOrder,
    player_turn_handler: PlayerTurnHandler,
    turn_state: TurnState
    game_events: GameEvents
}) => {
    return {
        set_current_turn_to_creature: create_set_current_turn_to_creature(props),
    }
}

export type GameplayUseCases = ReturnType<typeof create_gameplay_use_cases>;
