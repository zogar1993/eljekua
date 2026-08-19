import {PlayerTurnHandler} from "core/instruction_loop";
import {Position} from "core/battlegrid/Position";
import {Creature} from "core/battlegrid/creatures/Creature";
import {HitStatus} from "core/battlegrid/player_turn_handler/HitStatus";

export const create_interaction_test_helpers = ({player_turn_handler}: {
    player_turn_handler: PlayerTurnHandler
}) => ({
    select_option: (text: string) => {
        const interaction = player_turn_handler.get_interaction()
        if (interaction?.type !== "option_select")
            throw Error(`Expected option_select interaction, got ${interaction?.type ?? "null"}`)

        const option = interaction.available_options.find(option => option.text === text)
        if (!option) throw Error(`Could not find option "${text}"`)

        option.on_click()
    },

    select_position: (position: Omit<Position, "footprint">) => {
        const interaction = player_turn_handler.get_interaction()

        if (interaction?.type === "select_terrain"
            || interaction?.type === "select_area") {
            const full_position = interaction.clickable.find(
                clickable => clickable.x === position.x && clickable.y === position.y,
            )
            if (!full_position)
                throw Error(`Position (${position.x}, ${position.y}) not in clickable`)

            interaction.select(full_position)
            return
        }

        if (interaction?.type === "select_creature") {
            const full_position = interaction.clickable.find(
                clickable => clickable.x === position.x && clickable.y === position.y,
            )
            if (!full_position)
                throw Error(`Position (${position.x}, ${position.y}) not in clickable`)

            const creature = interaction.get_target_for_position(full_position)
            interaction.select(creature[0])
            return
        }

        if (interaction?.type === "select_path") {
            const destination = {...position, footprint: interaction.footprint}
            interaction.select(interaction.get_path_to_destination(destination))
            return
        }

        throw Error(`Expected select_creature, select_terrain, select_area, or select_path interaction, got ${interaction?.type ?? "null"}`)
    },

    has_option: (text: string) => {
        const interaction = player_turn_handler.get_interaction()
        if (interaction?.type !== "option_select") return false
        return interaction.available_options.some(option => option.text === text)
    },

    set_hit_status: (creature: Creature, status: HitStatus) => {
        const interaction = player_turn_handler.get_interaction()
        if (interaction?.type !== "hit_status_select")
            throw Error(`Expected hit_status_select interaction, got ${interaction?.type ?? "null"}`)

        interaction.on_status_change(creature, status)
    },

    confirm_hit_status: () => {
        const interaction = player_turn_handler.get_interaction()
        if (interaction?.type !== "hit_status_select")
            throw Error(`Expected hit_status_select interaction, got ${interaction?.type ?? "null"}`)

        interaction.on_confirm()
    },

    confirm_pending_interaction: () => {
        const interaction = player_turn_handler.get_interaction()
        if (interaction?.type === "hit_status_select")
            interaction.on_confirm()
    },
})
