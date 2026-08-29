import {GameState} from "core/game_state/GameState";

export const run_end_of_turn_hooks = ({game_state}: { game_state: GameState }) => {
    const {creatures, initiative_order} = game_state
    const current_turn_creature = initiative_order.get_current_creature()

    for (const creature of creatures.get_all()) {
        creature.remove_statuses({type: "turn_end", creature: current_turn_creature})
    }
}