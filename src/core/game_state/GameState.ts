import {create_battle_grid} from "core/battlegrid/BattleGrid";
import {create_initiative_order} from "core/initiative_order/InitiativeOrder";
import {create_settings} from "core/settings/Settings";
import {create_vm_state} from "core/virtual_machine/VMState";
import type {GameEvents} from "core/events/GameEvents";
import {create_creatures} from "core/creatures/Creatures";

export const create_game_state = ({
                                      game_events,
                                      battle_grid_size,
                                  }: {
    game_events: GameEvents
    battle_grid_size: { x: number, y: number }
}) => {
    const creatures = create_creatures()
    const battle_grid = create_battle_grid({size: battle_grid_size, creatures})
    const initiative_order = create_initiative_order({game_events})
    const settings = create_settings()
    const vm_state = create_vm_state({game_events})

    return {
        creatures,
        battle_grid,
        initiative_order,
        settings,
        vm_state,
    }
}

export type GameState = ReturnType<typeof create_game_state>
