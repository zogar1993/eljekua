import {Creature} from "scripts/battlegrid/creatures/Creature";
import {BattleGrid} from "scripts/battlegrid/BattleGrid";
import {ACTION_TYPE} from "scripts/battlegrid/creatures/ActionType";

export const run_start_of_turn_hooks = ({current_turn_creature, battle_grid}: {
    current_turn_creature: Creature,
    battle_grid: BattleGrid
}) => {
    for (const creature of battle_grid.creatures) {
        if (creature === current_turn_creature)
            creature.set_available_actions([ACTION_TYPE.STANDARD, ACTION_TYPE.MOVEMENT, ACTION_TYPE.MINOR])
        else
            creature.set_available_actions([ACTION_TYPE.OPPORTUNITY])

        creature.remove_statuses({type: "turn_start", creature: current_turn_creature})

        for (const status of creature.statuses)
            for (const duration of status.durations)
                if (duration.until === "next_turn_end" && creature === duration.creature)
                    duration.until = "turn_end"
    }
}