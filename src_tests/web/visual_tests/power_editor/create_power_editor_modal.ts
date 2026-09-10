import type {IRPower} from "core/types";
import {create_modal} from "web/visual_tests/create_modal";
import {create_power_form} from "web/visual_tests/power_editor/create_power_form";
import {create_html_element} from "web/utils/create_html_element";

export type PowerEditorModalMode = "create" | "edit"

const format_power_json = (power: IRPower): string => JSON.stringify(power, null, 2)

export const open_power_editor_modal = ({
                                            power,
                                            mode,
                                            on_confirm,
                                        }: {
    power: IRPower
    mode: PowerEditorModalMode
    on_confirm: (power: IRPower) => void
}) => {
    const html_layout = create_html_element("div", "visual-tests__power-editor-modal")

    const power_form = create_power_form({
        power,
        variant: "modal",
    })

    const html_json_preview = create_html_element("textarea", "visual-tests__power-json-preview") as HTMLTextAreaElement
    html_json_preview.readOnly = true
    html_json_preview.rows = 24
    html_json_preview.spellcheck = false

    const refresh_json_preview = () => {
        html_json_preview.value = format_power_json(power_form.get_power())
    }

    power_form.html_root.addEventListener("input", refresh_json_preview)
    power_form.html_root.addEventListener("change", refresh_json_preview)
    refresh_json_preview()

    const html_json_section = create_html_element("div", "visual-tests__power-editor-modal-json")
    const html_json_label = create_html_element("div", "visual-tests__field-group-title")
    html_json_label.textContent = "JSON"
    html_json_section.append(html_json_label, html_json_preview)

    html_layout.append(power_form.html_root, html_json_section)

    const html_footer = create_html_element("div", "visual-tests__dialog-buttons visual-tests__modal-footer")

    const html_cancel_button = document.createElement("button")
    html_cancel_button.type = "button"
    html_cancel_button.className = "visual-tests__button"
    html_cancel_button.textContent = "Cancel"

    const html_confirm_button = document.createElement("button")
    html_confirm_button.type = "button"
    html_confirm_button.className = "visual-tests__button"
    html_confirm_button.textContent = mode === "create" ? "Create power" : "Save power"

    const modal = create_modal({
        title: mode === "create" ? "Create power" : "Edit power",
        html_body: html_layout,
        html_footer,
    })

    html_cancel_button.addEventListener("click", () => modal.close())

    html_confirm_button.addEventListener("click", () => {
        on_confirm(power_form.get_power())
        modal.close()
    })

    html_footer.append(html_cancel_button, html_confirm_button)

    return modal
}
