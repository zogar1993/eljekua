import {create_event_manager} from "scripts/events/event_manager";
import {PlayerTurnHandlerContextSelect} from "scripts/battlegrid/player_turn_handler/PlayerTurnHandler";

export const create_game_events = () => ({
    player_available_interactions_changed: create_event_manager<PlayerTurnHandlerContextSelect>()
})

export type GameEvents = ReturnType<typeof create_game_events>