import {OptionButton} from "core/battlegrid/creature_option/CreatureOption";
import {create_html_element} from "web/utils/create_html_element";

const html_element = document.querySelector("#actions_menu")!

export const create_option_button_visual = (option: OptionButton): CreatureOptionButton => {
    const button = create_html_element("button", "option-button");
    button.innerText = option.text

    if (option.disabled)
        button.setAttribute("disabled", "")

    button.addEventListener("click", option.on_click)

    html_element.appendChild(button)

    return {
        remove: () => button.remove()
    }
}

export type CreatureOptionButton = {
    remove: () => void
}
