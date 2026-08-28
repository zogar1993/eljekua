import type {Interaction} from "core/instruction_loop";
import {INTERACTION_TYPE} from "core/instruction_loop";
import type {GameEvents} from "core/events/GameEvents";
import type {Position} from "core/battlegrid/Position";
import type {Creature} from "core/battlegrid/creatures/Creature";
import type {HitStatus} from "core/virtual_machine/expressions/constants/HitStatus";

export const create_interaction_test_helpers = ({game_events}: {
    game_events: GameEvents
}) => {
    let current_interaction: Interaction | null = null

    game_events.on_available_interactions_changed.add_handler(interaction => {
        current_interaction = interaction
    })

    return {
        has_pending_interaction: () => current_interaction !== null,

        select_option: (text: string) => {
            const interaction = current_interaction
            if (interaction?.type !== INTERACTION_TYPE.OPTION_SELECT)
                throw Error(`Expected option_select interaction, got ${interaction?.type ?? "null"}`)

            const option = interaction.available_options.find(option => option.text === text)
            if (!option) throw Error(`Could not find option "${text}"`)

            option.on_click()
        },

        select_position: (position: Omit<Position, "footprint">) => {
            const interaction = current_interaction

            if (interaction?.type === INTERACTION_TYPE.SELECT_TERRAIN
                || interaction?.type === INTERACTION_TYPE.SELECT_AREA) {
                const full_position = interaction.clickable.find(
                    clickable => clickable.x === position.x && clickable.y === position.y,
                )
                if (!full_position)
                    throw Error(`Position (${position.x}, ${position.y}) not in clickable`)

                interaction.select(full_position)
                return
            }

            if (interaction?.type === INTERACTION_TYPE.SELECT_CREATURE) {
                const full_position = interaction.clickable.find(
                    clickable => clickable.x === position.x && clickable.y === position.y,
                )
                if (!full_position)
                    throw Error(`Position (${position.x}, ${position.y}) not in clickable`)

                const creature = interaction.get_target_for_position(full_position)
                interaction.select(creature)
                return
            }

            if (interaction?.type === INTERACTION_TYPE.SELECT_PATH) {
                const destination = {...position, footprint: interaction.footprint}
                interaction.select(interaction.get_path_to_destination(destination))
                return
            }

            throw Error(`Expected select_creature, select_terrain, select_area, or select_path interaction, got ${interaction?.type ?? "null"}`)
        },

        has_option: (text: string) => {
            const interaction = current_interaction
            if (interaction?.type !== INTERACTION_TYPE.OPTION_SELECT) return false
            return interaction.available_options.some(option => option.text === text)
        },

        set_hit_status: (creature: Creature, status: HitStatus) => {
            const interaction = current_interaction
            if (interaction?.type !== INTERACTION_TYPE.HIT_STATUS_SELECT)
                throw Error(`Expected hit_status_select interaction, got ${interaction?.type ?? "null"}`)

            interaction.on_status_change(creature, status)
        },

        confirm_hit_status: () => {
            const interaction = current_interaction
            if (interaction?.type !== INTERACTION_TYPE.HIT_STATUS_SELECT)
                throw Error(`Expected hit_status_select interaction, got ${interaction?.type ?? "null"}`)

            interaction.on_confirm()
        },

        confirm_pending_interaction: () => {
            const interaction = current_interaction
            if (interaction?.type === INTERACTION_TYPE.HIT_STATUS_SELECT)
                interaction.on_confirm()
        },
    }
}
