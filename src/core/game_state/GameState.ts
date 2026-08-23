import {create_battle_grid} from "core/battlegrid/BattleGrid";
import {create_initiative_order} from "core/initiative_order/InitiativeOrder";
import {create_settings} from "core/settings/Settings";
import {create_turn_state} from "core/battlegrid/player_turn_handler/TurnState";
import type {GameEvents} from "core/events/GameEvents";

export const create_game_state = ({
                                      game_events,
                                      battle_grid_size,
                                  }: {
    game_events: GameEvents
    battle_grid_size: { x: number, y: number }
}) => {
    const battle_grid = create_battle_grid({size: battle_grid_size, game_events})
    const initiative_order = create_initiative_order({game_events})
    const settings = create_settings()
    const turn_state = create_turn_state({game_events})

    return {
        battle_grid,
        initiative_order,
        settings,
        turn_state,
    }
}

export type GameState = ReturnType<typeof create_game_state>
