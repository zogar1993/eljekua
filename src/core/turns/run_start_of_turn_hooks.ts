import type {ActionType} from "core/battlegrid/creatures/ActionType";
import {ACTION_TYPE} from "core/battlegrid/creatures/ActionType";
import type {GameEvents} from "core/events/GameEvents";
import {GameState} from "core/game_state/GameState";
import {restore_creature_actions} from "core/battlegrid/creatures/Creature";

export const run_start_of_turn_hooks = ({game_state, game_events}: {
    game_state: GameState,
    game_events: GameEvents
}) => {
    const {creatures, initiative_order} = game_state
    const current_turn_creature = initiative_order.get_current_creature()

    for (const creature of creatures.get_all()) {
        if (creature === current_turn_creature)
            restore_creature_actions({creature, actions: START_OF_YOUR_TURN_ACTIONS})
        else
            restore_creature_actions({creature, actions: START_OF_ALL_TURN_ACTIONS})

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