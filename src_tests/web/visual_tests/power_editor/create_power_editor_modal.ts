import type {IRPower} from "core/types";
import {create_modal} from "web/visual_tests/create_modal";
import {create_power_form} from "web/visual_tests/power_editor/create_power_form";
import {create_html_element} from "web/utils/create_html_element";

const format_power_json = (power: IRPower): string => JSON.stringify(power, null, 2)

export const open_power_editor_modal = ({
                                            title,
                                            power,
                                            on_power_changed,
                                        }: {
    title: string
    power: IRPower
    on_power_changed: (power: IRPower) => void
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

    const notify_power_changed = () => {
        const next_power = power_form.get_power()
        refresh_json_preview()
        on_power_changed(next_power)
    }

    const refresh_json_preview = () => {
        html_json_preview.value = format_power_json(power_form.get_power())
    }

    power_form.html_root.addEventListener("input", notify_power_changed)
    power_form.html_root.addEventListener("change", notify_power_changed)
    refresh_json_preview()

    const html_json_section = create_html_element("div", "visual-tests__power-editor-modal-json")
    const html_json_label = create_html_element("div", "visual-tests__field-group-title")
    html_json_label.textContent = "JSON"
    html_json_section.append(html_json_label, html_json_preview)

    html_layout.append(power_form.html_root, html_json_section)

    create_modal({
        title,
        html_body: html_layout,
    })
}
