import {OptionButtonVisual} from "scripts/battlegrid/option_buttons/OptionButtonVisual";

export const create_option_buttons = ({create_option_button_visual}: {
    create_option_button_visual: (option: OptionButton) => OptionButtonVisual
}): OptionButtons => {
    let visual_options: Array<OptionButtonVisual> = []
    return {
        display_options: (options: Array<OptionButton>) => {
            if (visual_options.length > 0)
                throw new AssertionError("options where attempted to be displayed without cleaning up before")
            visual_options = options.map(option => create_option_button_visual(option))
        },
        remove_options: () => {
            visual_options.forEach(option => option.remove())
            visual_options = []
        }
    }
}

export type OptionButtons = {
    display_options: (options: Array<OptionButton>) => void
    remove_options: () => void
}

export type OptionButton = {
    text: string,
    on_click: () => void
    disabled: boolean,
}