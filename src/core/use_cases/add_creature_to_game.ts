import type {CreatureData} from "core/battlegrid/creatures/CreatureData";
import type {GameState} from "core/game_state/GameState";
import {roll_d} from "core/randomness/dice";
import type {GameEvents} from "core/events/GameEvents";


export const create_add_creature_to_game = ({
                                                game_state,
                                                game_events
                                            }: {
                                                game_state: GameState
                                                game_events: GameEvents
                                            }
) => (
    {data}: { data: CreatureData }
) => {
    const {creatures, initiative_order} = game_state
    const creature = creatures.create(data)

    game_events.on_creature_added_to_game.raise(creature)

    initiative_order.add_entry({creature, initiative: roll_d(20)})
}