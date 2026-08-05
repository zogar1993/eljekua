import {create_event_manager} from "scripts/events/event_manager";
import {AvailableInteractions} from "scripts/battlegrid/player_turn_handler/PlayerTurnHandler";
import {Creature} from "scripts/battlegrid/creatures/Creature";

export const create_game_events = () => ({
    player_available_interactions_changed: create_event_manager<AvailableInteractions>(),
    on_creature_added_to_game: create_event_manager<Creature>()
})

export type GameEvents = ReturnType<typeof create_game_events>