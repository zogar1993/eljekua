import {
    create_content_button,
    CONTENT_EDITOR_BUTTON_SIZE,
    CONTENT_EDITOR_BUTTON_VARIANT,
} from "web/content_editor/create_content_button";
import {
    create_compact_text_input,
    create_number_input,
    read_number_value,
    read_text_value,
} from "web/visual_tests/power_editor/create_form_controls";
import {create_html_element} from "web/core/utils/create_html_element";

export const create_resistance_list_editor = ({
                                                  resistances,
                                              }: {
    resistances: Record<string, number>
}) => {
    const html_root = create_html_element("div", "visual-tests__resistance-table")
    const html_grid = create_html_element("div", "visual-tests__resistance-table-grid")

    const html_header_damage_type = create_html_element("span", "content-editor__label visual-tests__resistance-table-header-cell")
    html_header_damage_type.textContent = "Damage type"
    const html_header_value = create_html_element("span", "content-editor__label visual-tests__resistance-table-header-cell")
    html_header_value.textContent = "Value"
    const html_header_actions = create_html_element("span", "visual-tests__resistance-table-header-cell visual-tests__resistance-table-actions-header")

    type ResistanceEntry = {
        html_damage_type: HTMLInputElement
        html_value: HTMLInputElement
        html_remove_button: HTMLButtonElement
        get_damage_type: () => string
        get_value: () => number
    }

    const entries: Array<ResistanceEntry> = []

    const notify_changed = () => {
        html_root.dispatchEvent(new Event("input", {bubbles: true}))
    }

    const refresh_grid = () => {
        html_grid.replaceChildren(
            html_header_damage_type,
            html_header_value,
            html_header_actions,
        )
        for (const entry of entries)
            html_grid.append(entry.html_damage_type, entry.html_value, entry.html_remove_button)
    }

    const create_resistance_entry = ({
                                         damage_type,
                                         value,
                                         on_remove,
                                     }: {
        damage_type: string
        value: number
        on_remove: () => void
    }): ResistanceEntry => {
        const html_damage_type = create_compact_text_input({
            value: damage_type,
            placeholder: "fire",
        })
        const html_value = create_number_input({value, compact: true})

        html_damage_type.addEventListener("input", notify_changed)
        html_value.addEventListener("input", notify_changed)

        const html_remove_button = create_content_button({
            text: "Remove",
            variant: CONTENT_EDITOR_BUTTON_VARIANT.DANGER,
            size: CONTENT_EDITOR_BUTTON_SIZE.SMALL,
            on_click: on_remove,
        })

        return {
            html_damage_type,
            html_value,
            html_remove_button,
            get_damage_type: () => read_text_value(html_damage_type).trim(),
            get_value: () => read_number_value(html_value),
        }
    }

    const add_entry = (damage_type = "", value = 0) => {
        const entry = create_resistance_entry({
            damage_type,
            value,
            on_remove: () => {
                const index = entries.indexOf(entry)
                if (index >= 0)
                    entries.splice(index, 1)
                refresh_grid()
                notify_changed()
            },
        })
        entries.push(entry)
        refresh_grid()
    }

    for (const [damage_type, value] of Object.entries(resistances))
        add_entry(damage_type, value)

    const html_add_button = create_content_button({
        text: "Add resistance",
        variant: CONTENT_EDITOR_BUTTON_VARIANT.SECONDARY,
        size: CONTENT_EDITOR_BUTTON_SIZE.SMALL,
        on_click: () => {
            add_entry()
            notify_changed()
        },
    })

    html_root.append(html_grid, html_add_button)
    refresh_grid()

    const get_resistances = (): Record<string, number> => {
        const result: Record<string, number> = {}
        for (const entry of entries) {
            const damage_type = entry.get_damage_type()
            if (damage_type.length === 0)
                continue
            result[damage_type] = entry.get_value()
        }
        return result
    }

    return {html_root, get_resistances}
}
