import type {IRPower} from "core/types";
import {create_html_element} from "web/core/utils/create_html_element";

export const create_creature_power_picker = ({
                                                 selected_powers,
                                                 get_available_powers,
                                             }: {
    selected_powers: Array<IRPower>
    get_available_powers: () => Array<IRPower>
}) => {
    const html_root = create_html_element("div", "visual-tests__power-picker")
    const html_grid = create_html_element("div", "visual-tests__power-picker-grid")

    const html_header_assigned = create_html_element("span", "content-editor__label visual-tests__power-picker-header-cell")
    html_header_assigned.textContent = "Assigned"
    const html_header_name = create_html_element("span", "content-editor__label visual-tests__power-picker-header-cell")
    html_header_name.textContent = "Power"

    type PowerPickerEntry = {
        power_name: string
        html_checkbox: HTMLInputElement
    }

    const entries: Array<PowerPickerEntry> = []
    const initial_selected_power_names = new Set(selected_powers.map(power => power.name))

    const notify_changed = () => {
        html_root.dispatchEvent(new Event("input", {bubbles: true}))
    }

    const read_selected_power_names = (): Set<string> =>
        new Set(entries.filter(entry => entry.html_checkbox.checked).map(entry => entry.power_name))

    const refresh_power_options = () => {
        const selected_power_names = entries.length > 0
            ? read_selected_power_names()
            : initial_selected_power_names

        entries.length = 0
        html_grid.replaceChildren(html_header_assigned, html_header_name)

        for (const power of get_available_powers()) {
            const html_checkbox = create_html_element("input", "content-editor__checkbox visual-tests__power-picker-checkbox") as HTMLInputElement
            html_checkbox.type = "checkbox"
            html_checkbox.checked = selected_power_names.has(power.name)
            html_checkbox.addEventListener("change", notify_changed)

            const html_name = create_html_element("span", "visual-tests__power-picker-name")
            html_name.textContent = power.name

            entries.push({power_name: power.name, html_checkbox})
            html_grid.append(html_checkbox, html_name)
        }
    }

    refresh_power_options()
    html_root.append(html_grid)

    const get_selected_powers = (): Array<IRPower> => {
        const powers_by_name = new Map(get_available_powers().map(power => [power.name, power]))
        return entries
            .filter(entry => entry.html_checkbox.checked)
            .map(entry => powers_by_name.get(entry.power_name))
            .filter((power): power is IRPower => power !== undefined)
    }

    return {html_root, get_selected_powers, refresh_power_options}
}
