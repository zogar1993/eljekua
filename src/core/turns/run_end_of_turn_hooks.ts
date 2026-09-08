import {remove_creature_statuses} from "core/battlegrid/creatures/Creature";
import type {GameState} from "core/game_state/GameState";

export const run_end_of_turn_hooks = ({game_state}: { game_state: GameState }) => {
    const {creatures, initiative_order} = game_state
    const current_turn_creature = initiative_order.get_current_creature()

    for (const creature of creatures.get_all()) {
        remove_creature_statuses({creature, type: "turn_end", until_creature: current_turn_creature})
    }
}