import type {IRPower} from "core/types";
import {
    create_default_power,
    POWER_EDITOR_TEMPLATE,
} from "web/visual_tests/power_editor/power_editor_defaults";
import {open_power_editor_modal} from "web/visual_tests/power_editor/create_power_editor_modal";
import {create_field_group_title} from "web/visual_tests/create_labeled_field";
import {create_html_element} from "web/utils/create_html_element";

type PowerListEntry = {
    power: IRPower
    html_root: HTMLElement
    update_display: () => void
}

export const create_power_editor = ({
                                        initial_powers = [],
                                        on_powers_changed,
                                    }: {
    initial_powers?: Array<IRPower>
    on_powers_changed?: () => void
} = {}) => {
    const html_root = create_html_element("div", "visual-tests__power-editor")
    const html_list = create_html_element("div", "visual-tests__power-editor-list")

    const entries: Array<PowerListEntry> = []

    const notify_powers_changed = () => {
        on_powers_changed?.()
    }

    const get_powers = (): Array<IRPower> => entries.map(entry => entry.power)

    const refresh_list = () => {
        html_list.replaceChildren()
        for (const entry of entries)
            html_list.append(entry.html_root)
    }

    const create_list_item = (entry: PowerListEntry) => {
        const html_item = create_html_element("div", "visual-tests__power-list-item")

        const html_name = create_html_element("span", "visual-tests__power-list-item-name")

        const update_display = () => {
            html_name.textContent = entry.power.name || "Unnamed power"
        }

        const html_edit_button = document.createElement("button")
        html_edit_button.type = "button"
        html_edit_button.className = "visual-tests__button visual-tests__button--small"
        html_edit_button.textContent = "Edit"

        const html_remove_button = document.createElement("button")
        html_remove_button.type = "button"
        html_remove_button.className = "visual-tests__button visual-tests__button--small"
        html_remove_button.textContent = "Remove"

        html_edit_button.addEventListener("click", () => {
            open_power_editor_modal({
                title: "Edit power",
                power: entry.power,
                on_power_changed: (power) => {
                    entry.power = power
                    update_display()
                    notify_powers_changed()
                },
            })
        })

        html_remove_button.addEventListener("click", () => {
            const index = entries.indexOf(entry)
            if (index >= 0) entries.splice(index, 1)
            refresh_list()
            notify_powers_changed()
        })

        const html_actions = create_html_element("div", "visual-tests__power-list-item-actions")
        html_actions.append(html_edit_button, html_remove_button)

        html_item.append(html_name, html_actions)
        entry.html_root = html_item
        entry.update_display = update_display
        update_display()
    }

    const add_entry = (power: IRPower, options?: { notify?: boolean }) => {
        const entry: PowerListEntry = {
            power,
            html_root: document.createElement("div"),
            update_display: () => {},
        }
        create_list_item(entry)
        entries.push(entry)
        refresh_list()
        if (options?.notify ?? true)
            notify_powers_changed()
        return entry
    }

    const open_create_modal = () => {
        const entry = add_entry(create_default_power(POWER_EDITOR_TEMPLATE.BLANK))
        open_power_editor_modal({
            title: "Create power",
            power: entry.power,
            on_power_changed: (power) => {
                entry.power = power
                entry.update_display()
                notify_powers_changed()
            },
        })
    }

    const set_powers = (powers: Array<IRPower>, options?: { silent?: boolean }) => {
        entries.length = 0
        for (const power of powers) {
            const entry: PowerListEntry = {
                power,
                html_root: document.createElement("div"),
                update_display: () => {},
            }
            create_list_item(entry)
            entries.push(entry)
        }
        refresh_list()
        if (!options?.silent)
            notify_powers_changed()
    }

    for (const power of initial_powers)
        add_entry(power, {notify: false})

    const html_add_button = document.createElement("button")
    html_add_button.type = "button"
    html_add_button.className = "visual-tests__button visual-tests__button--small"
    html_add_button.textContent = "Add power"
    html_add_button.addEventListener("click", open_create_modal)

    const html_add_controls = create_html_element("div", "visual-tests__power-editor-add")
    html_add_controls.append(html_add_button)

    html_root.append(
        create_field_group_title("Powers"),
        html_list,
        html_add_controls,
    )

    return {html_root, get_powers, set_powers}
}
