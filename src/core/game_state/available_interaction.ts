import type {GameEvents} from "core/events/GameEvents";
import type {VMState} from "core/virtual_machine/VMState";
import {type Interaction, INTERACTION_NONE, INTERACTION_TYPE,} from "core/interactions/Interactions";

export const create_available_interaction = ({
                                                 game_events,
                                                 vm_state,
                                             }: {
    game_events: GameEvents
    vm_state: VMState
}) => {
    let current_interaction: Interaction = INTERACTION_NONE

    const set_available_interactions = (interaction: Interaction) => {
        current_interaction = interaction

        if (interaction.type === INTERACTION_TYPE.NONE) {
            game_events.on_available_interactions_changed.raise(interaction)
        } else {
            const creature = vm_state.get_acting_creature()
            game_events.on_available_interactions_changed.raise({...interaction, creature})
        }
    }

    const get_current = () => current_interaction

    return {
        get_current,
        set_available_interactions,
    }
}

export type AvailableInteraction = ReturnType<typeof create_available_interaction>
