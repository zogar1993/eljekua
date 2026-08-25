import type {Creature} from "core/battlegrid/creatures/Creature";
import type {GameEvents} from "core/events/GameEvents";
import {create_initiative_entry_visual, InitiativeEntryVisual,} from "web/initiative_order/InitiativeEntryVisual";

export const create_initiative_order_ui = ({game_events}: { game_events: GameEvents }) => {
    const visuals = new Map<Creature, InitiativeEntryVisual>()
    let current_creature: Creature | null = null

    const set_current_creature = (creature: Creature) => {
        if (current_creature !== null)
            visuals.get(current_creature)?.set_current_turn(false)

        current_creature = creature
        visuals.get(creature)?.set_current_turn(true)
    }

    game_events.on_initiative_entry_added.add_handler(({creature, initiative, index}) => {
        visuals.set(creature, create_initiative_entry_visual({creature, initiative, index}))
    })

    game_events.on_initiative_current_creature_changed.add_handler(creature => {
        set_current_creature(creature)
    })
}
