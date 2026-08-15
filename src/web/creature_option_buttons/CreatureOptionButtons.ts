import {GameEvents} from "core/events/GameEvents";
import {OptionButton} from "core/battlegrid/creature_option/CreatureOption";
import {create_option_button_visual, CreatureOptionButton} from "web/creature_option_buttons/CreatureOptionButton";
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

    game_events.on_available_interactions_changed.add_handler((interactions) => {
        if (interactions?.type === "option_select")
            display_options(interactions.available_options)
        else
            remove_options()
    })
}
