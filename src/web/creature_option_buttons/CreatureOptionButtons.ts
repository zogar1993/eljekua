import type {GameEvents} from "core/events/GameEvents";
import {INTERACTION_TYPE} from "core/instruction_loop";
import type {OptionButton} from "core/battlegrid/creature_option/CreatureOption";
import type {CreatureOptionButton} from "web/creature_option_buttons/CreatureOptionButton";
import {create_option_button_visual} from "web/creature_option_buttons/CreatureOptionButton";
import {AssertionError} from "stdlib/AssertionError";

export const create_option_buttons_ui = ({game_events}: { game_events: GameEvents }) => {
    let visual_options: Array<CreatureOptionButton> = []

    const remove_options = () => {
        visual_options.forEach(option => option.remove())
        visual_options = []
    }

    const display_options = (options: Array<OptionButton>) => {
        if (visual_options.length > 0)
            throw new AssertionError("options where attempted to be displayed without cleaning up before")
        visual_options = options.map(option => create_option_button_visual(option))
    }

    game_events.on_available_interactions_changed.add_handler(interaction => {
        if (interaction?.type === INTERACTION_TYPE.OPTION_SELECT)
            display_options(interaction.available_options)
        else
            remove_options()
    })
}
