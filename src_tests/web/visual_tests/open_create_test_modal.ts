import {
    create_content_button,
    CONTENT_EDITOR_BUTTON_SIZE,
    CONTENT_EDITOR_BUTTON_VARIANT,
} from "web/content_editor/create_content_button";
import {create_modal} from "web/visual_tests/create_modal";
import {create_labeled_field} from "web/visual_tests/create_labeled_field";
import {create_html_element} from "web/core/utils/create_html_element";

export const open_create_test_modal = ({
                                           title = "New test",
                                           accept_label = "Create",
                                           initial_path = "",
                                           validate_path,
                                           on_accept,
                                       }: {
    title?: string
    accept_label?: string
    initial_path?: string
    validate_path?: (path: string) => Promise<string | null> | string | null
    on_accept: (path: string) => void | Promise<void>
}) => {
    const html_name_input = create_html_element("input", "content-editor__input visual-tests__input") as HTMLInputElement
    html_name_input.value = initial_path

    const html_error = create_html_element("div", "visual-tests__modal-error")
    html_error.hidden = true

    const html_name_field = create_labeled_field({
        label: "Test name",
        control: html_name_input,
    })

    const html_body = create_html_element("div", "visual-tests__create-test-modal")
    html_body.append(html_name_field, html_error)

    const html_footer = create_html_element("div", "visual-tests__modal-footer")

    const html_cancel_button = create_content_button({
        text: "Cancel",
        variant: CONTENT_EDITOR_BUTTON_VARIANT.SECONDARY,
        size: CONTENT_EDITOR_BUTTON_SIZE.SMALL,
    })

    const html_accept_button = create_content_button({
        text: accept_label,
        variant: CONTENT_EDITOR_BUTTON_VARIANT.PRIMARY,
        size: CONTENT_EDITOR_BUTTON_SIZE.SMALL,
    })

    html_footer.append(html_cancel_button, html_accept_button)

    const {close} = create_modal({
        title,
        html_body,
        html_footer,
    })

    const show_error = (message: string) => {
        html_error.textContent = message
        html_error.hidden = false
    }

    const clear_error = () => {
        html_error.hidden = true
        html_error.textContent = ""
    }

    const try_accept = async () => {
        clear_error()
        const path = html_name_input.value.trim()
        if (path.length === 0) {
            show_error("Enter a test name.")
            return
        }

        if (validate_path !== undefined) {
            const validation_error = await validate_path(path)
            if (validation_error !== null) {
                show_error(validation_error)
                return
            }
        }

        close()
        void on_accept(path)
    }

    html_cancel_button.addEventListener("click", close)
    html_accept_button.addEventListener("click", () => {
        void try_accept()
    })

    html_name_input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault()
            void try_accept()
        }
    })

    html_name_input.focus()
}
