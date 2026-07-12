import {OptionButtonVisual} from "scripts/battlegrid/option_buttons/OptionButtonVisual";
import {OptionButton} from "scripts/battlegrid/option_buttons/OptionButtons";
import {remove_item_from_array} from "scripts/ts_utils/remove_item_from_array";

type OptionButtonMockUI = OptionButtonVisual & OptionButton

const option_buttons = {
    buttons: [] as Array<OptionButtonMockUI>
}

export const create_option_button_visual = (data: OptionButton): OptionButtonVisual => {
    const visual: OptionButtonMockUI = {
        ...data,
        remove: jest.fn()
    }

    visual.remove = () => option_buttons.buttons = remove_item_from_array(option_buttons.buttons, visual)

    option_buttons.buttons.push(visual)

    return visual
}

export const option_buttons_test_ui = {
    click: (text: string) => {
        const button = option_buttons.buttons.find(button => button.text === text)
        if (!button) throw (`Could not find button "${text}"`)
        button.on_click()
    },
    has_button: (text: string) => !!option_buttons.buttons.find(button => button.text === text)
}