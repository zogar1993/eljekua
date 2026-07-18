import {OptionButton} from "scripts/battlegrid/option_buttons/OptionButtons";
import {create_html_element} from "web_components/utils/create_html_element";

const html_element = document.querySelector("#actions_menu")!
export const create_option_button_visual = (option: OptionButton): OptionButtonVisual => {
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

export type OptionButtonVisual = {
    remove: () => void
}