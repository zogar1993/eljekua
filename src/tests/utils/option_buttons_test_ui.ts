import {CreatureOptionButton} from "web/creature_option_buttons/CreatureOptionButton";
import {OptionButton} from "core/battlegrid/creature_option/CreatureOption";
import {remove_item_from_array} from "stdlib/remove_item_from_array";
import {GameEvents} from "core/events/GameEvents";

type OptionButtonMockUI = CreatureOptionButton & OptionButton

const option_buttons = {
    buttons: [] as Array<OptionButtonMockUI>
}

export const create_option_button_visual = (data: OptionButton): CreatureOptionButton => {
    const visual: OptionButtonMockUI = {
        ...data,
        remove: jest.fn()
    }

    visual.remove = () => option_buttons.buttons = remove_item_from_array(option_buttons.buttons, visual)

    option_buttons.buttons.push(visual)

    return visual
}

export const wire_option_buttons_test_ui = ({game_events}: { game_events: GameEvents }) => {
    game_events.on_available_interactions_changed.add_handler((interactions) => {
        if (interactions?.type === "option_select")
            interactions.available_options.forEach(option => create_option_button_visual(option))
        else
            while (option_buttons.buttons.length > 0)
                option_buttons.buttons[0].remove()
    })
}

export const option_buttons_test_ui = {
    click: (text: string) => {
        const button = option_buttons.buttons.find(button => button.text === text)
        if (!button) throw (`Could not find button "${text}"`)
        button.on_click()
    },
    has_button: (text: string) => !!option_buttons.buttons.find(button => button.text === text)
}
