import {Creature} from "core/battlegrid/creatures/Creature";
import {BattleGrid} from "core/battlegrid/BattleGrid";
import {ACTION_TYPE, ActionType} from "core/battlegrid/creatures/ActionType";
import type {GameEvents} from "core/events/GameEvents";

export const run_start_of_turn_hooks = ({current_turn_creature, battle_grid, game_events}: {
    current_turn_creature: Creature,
    battle_grid: BattleGrid
    game_events: GameEvents
}) => {
    for (const creature of battle_grid.creatures) {
        if (creature === current_turn_creature)
            creature.restore_actions(START_OF_YOUR_TURN_ACTIONS)
        else
            creature.restore_actions(START_OF_ALL_TURN_ACTIONS)

        game_events.on_creature_available_actions_changed.raise(creature)

        creature.remove_statuses({type: "turn_start", creature: current_turn_creature})

        for (const status of creature.statuses)
            for (const duration of status.durations)
                if (duration.until === "next_turn_end" && creature === duration.creature)
                    duration.until = "turn_end"
    }
}

const START_OF_ALL_TURN_ACTIONS: Array<ActionType> = [
    ACTION_TYPE.OPPORTUNITY,
    ACTION_TYPE.FREE_ATTACK
] as const

const START_OF_YOUR_TURN_ACTIONS: Array<ActionType> = [
    ACTION_TYPE.STANDARD,
    ACTION_TYPE.MOVEMENT,
    ACTION_TYPE.MINOR,
    ACTION_TYPE.IMMEDIATE,
    ...START_OF_ALL_TURN_ACTIONS
] as const
