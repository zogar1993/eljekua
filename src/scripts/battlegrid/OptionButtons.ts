export const create_option_buttons = (): OptionButtons => {
    const html_element = document.querySelector("#actions_menu")!
    return {
        display_options: (options: Array<ButtonOption>) => {
            options.forEach(option => {
                const button = document.createElement("button");
                button.innerText = option.text

                if (option.disabled)
                    button.setAttribute("disabled", "")

                button.addEventListener("click", option.on_click)

                html_element.appendChild(button)
            })
        },
        remove_options: () => {
            const buttons = html_element.querySelectorAll("#actions_menu > button")
            buttons.forEach(button => button.remove())
        }
    }
}

export type OptionButtons = {
    display_options: (options: Array<ButtonOption>) => void
    remove_options: () => void
}

export type ButtonOption = {
    text: string,
    on_click: () => void
    disabled: boolean,
}
