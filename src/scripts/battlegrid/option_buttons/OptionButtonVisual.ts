import {OptionButton} from "scripts/battlegrid/option_buttons/OptionButtons";

const html_element = document.querySelector("#actions_menu")!
export const create_option_button_visual = (option: OptionButton): OptionButtonVisual => {
    const button = document.createElement("button");
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