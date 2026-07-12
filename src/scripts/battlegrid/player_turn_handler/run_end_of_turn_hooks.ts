import {Creature} from "scripts/battlegrid/creatures/Creature";
import {BattleGrid} from "scripts/battlegrid/BattleGrid";

export const run_end_of_turn_hooks = ({current_turn_creature, battle_grid}: {
    current_turn_creature: Creature,
    battle_grid: BattleGrid
}) => {
    for (const creature of battle_grid.creatures) {
        creature.remove_statuses({type: "turn_end", creature: current_turn_creature})
    }
}