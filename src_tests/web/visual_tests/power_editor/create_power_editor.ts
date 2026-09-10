import type {IRPower} from "core/types";
import {
    create_default_power,
    POWER_EDITOR_TEMPLATE,
} from "web/visual_tests/power_editor/power_editor_defaults";
import {create_power_form} from "web/visual_tests/power_editor/create_power_form";
import {create_field_group_title} from "web/visual_tests/create_labeled_field";
import {create_html_element} from "web/utils/create_html_element";

export const create_power_editor = ({
                                        initial_powers = [],
                                        on_powers_changed,
                                    }: {
    initial_powers?: Array<IRPower>
    on_powers_changed?: () => void
} = {}) => {
    const html_root = create_html_element("div", "visual-tests__power-editor")
    const html_list = create_html_element("div", "visual-tests__power-editor-list")

    const editors: Array<ReturnType<typeof create_power_form>> = []

    const notify_powers_changed = () => {
        on_powers_changed?.()
    }

    const refresh_list = () => {
        html_list.replaceChildren()
        for (const editor of editors)
            html_list.append(editor.html_root)
    }

    const add_power = (power: IRPower) => {
        const editor = create_power_form({
            power,
            on_remove: () => {
                const index = editors.indexOf(editor)
                if (index >= 0) editors.splice(index, 1)
                refresh_list()
                notify_powers_changed()
            },
        })
        editors.push(editor)
        refresh_list()
        notify_powers_changed()
    }

    const set_powers = (powers: Array<IRPower>) => {
        editors.length = 0
        for (const power of powers) {
            const editor = create_power_form({
                power,
                on_remove: () => {
                    const index = editors.indexOf(editor)
                    if (index >= 0) editors.splice(index, 1)
                    refresh_list()
                    notify_powers_changed()
                },
            })
            editors.push(editor)
        }
        refresh_list()
        notify_powers_changed()
    }

    for (const power of initial_powers)
        add_power(power)

    const html_add_button = document.createElement("button")
    html_add_button.type = "button"
    html_add_button.className = "visual-tests__button visual-tests__button--small"
    html_add_button.textContent = "Add power"
    html_add_button.addEventListener("click", () => {
        add_power(create_default_power(POWER_EDITOR_TEMPLATE.BLANK))
    })

    const html_add_controls = create_html_element("div", "visual-tests__power-editor-add")
    html_add_controls.append(html_add_button)

    html_root.append(
        create_field_group_title("Powers"),
        html_list,
        html_add_controls,
    )

    const get_powers = (): Array<IRPower> => editors.map(editor => editor.get_power())

    return {html_root, get_powers, set_powers}
}
