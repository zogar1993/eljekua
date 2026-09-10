import {create_html_element} from "web/core/utils/create_html_element";

export type UnsavedChangesChoice = "save" | "discard" | "cancel"

export const prompt_unsaved_changes = (): Promise<UnsavedChangesChoice> => {
    const html_overlay = create_html_element("div", "visual-tests__dialog-overlay")
    const html_dialog = create_html_element("div", "visual-tests__dialog")
    const html_message = create_html_element("p", "visual-tests__dialog-message")
    html_message.textContent = "Save changes to the current test before loading another?"

    const create_dialog_button = (text: string, choice: UnsavedChangesChoice) => {
        const button = document.createElement("button")
        button.type = "button"
        button.className = "visual-tests__button"
        button.textContent = text
        button.addEventListener("click", () => {
            html_overlay.remove()
            resolve(choice)
        })
        return button
    }

    let resolve!: (choice: UnsavedChangesChoice) => void

    const html_buttons = create_html_element("div", "visual-tests__dialog-buttons")
    html_buttons.append(
        create_dialog_button("Yes", "save"),
        create_dialog_button("No", "discard"),
        create_dialog_button("Cancel", "cancel"),
    )

    html_dialog.append(html_message, html_buttons)
    html_overlay.append(html_dialog)
    document.body.append(html_overlay)

    return new Promise<UnsavedChangesChoice>(promise_resolve => {
        resolve = promise_resolve
    })
}
