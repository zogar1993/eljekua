import {create_battle_grid} from "core/battlegrid/BattleGrid";
import {create_initiative_order} from "core/initiative_order/InitiativeOrder";
import {create_settings} from "core/settings/Settings";
import {create_turn_state} from "core/battlegrid/player_turn_handler/TurnState";
import type {GameEvents} from "core/events/GameEvents";
import type {InitiativeEntryVisual} from "core/initiative_order/InitiativeEntryVisual";
import type {Creature} from "core/battlegrid/creatures/Creature";
import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";

export const create_game_state = ({
                                      game_events,
                                      create_initiative_entry_visual,
                                      battle_grid_size,
                                  }: {
    game_events: GameEvents
    create_initiative_entry_visual: (props: {
        creature: Creature
        initiative: ExprNumberResolved
        index: number
    }) => InitiativeEntryVisual
    battle_grid_size: { x: number, y: number }
}) => {
    const battle_grid = create_battle_grid({size: battle_grid_size, game_events})
    const initiative_order = create_initiative_order({create_initiative_entry_visual})
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
