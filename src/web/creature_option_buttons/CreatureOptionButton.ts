import type {OptionButton} from "core/battlegrid/creature_option/CreatureOption";
import {create_html_element} from "web/utils/create_html_element";
import {InstructionLoop, INTERACTION_TYPE} from "core/instruction_loop";

const html_element = document.querySelector("#actions_menu")!

export const create_option_button_visual = ({option, game_input}: {
    option: OptionButton,
    game_input: InstructionLoop
}): CreatureOptionButton => {
    const button = create_html_element("button", "option-button");
    button.innerText = option.text

    if (option.disabled)
        button.setAttribute("disabled", "")

    button.addEventListener("click", () => {
        game_input.select({type: INTERACTION_TYPE.OPTION_SELECT, option: option.text})
    })

    html_element.appendChild(button)

    return {
        remove: () => button.remove()
    }
}

export type CreatureOptionButton = {
    remove: () => void
}
