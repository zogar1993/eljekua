import {create_set_current_turn_to_creature} from "core/use_cases/gameplay/set_current_turn_to_creature";
import {PlayerTurnHandler} from "core/instruction_loop";
import type {GameEvents} from "core/events/GameEvents";
import type {GameState} from "core/game_state/GameState";

export const create_gameplay_use_cases = (props: {
    game_state: GameState
    player_turn_handler: PlayerTurnHandler
    game_events: GameEvents
}) => {
    return {
        set_current_turn_to_creature: create_set_current_turn_to_creature(props),
    }
}

export type GameplayUseCases = ReturnType<typeof create_gameplay_use_cases>;
