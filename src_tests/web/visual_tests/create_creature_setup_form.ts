import type {ScenarioCreatureSetup} from "scenario_test/ScenarioTest";
import {POWER_SET, type PowerSetName} from "scenario_test/resolve_creature_setup";
import {create_field_group_title, create_labeled_field} from "web/visual_tests/create_labeled_field";
import {create_html_element} from "web/utils/create_html_element";

export const create_creature_setup_form = ({
                                               on_add_creature,
                                           }: {
    on_add_creature: (creature: ScenarioCreatureSetup) => void
}) => {
    const html_form = create_html_element("div", "visual-tests__setup-form")
    html_form.append(create_field_group_title("Add creature"))

    const html_name = create_html_element("input", "visual-tests__input") as HTMLInputElement
    html_name.value = "hero"

    const html_team = create_html_element("input", "visual-tests__input") as HTMLInputElement
    html_team.value = "1"

    const html_x = create_html_element("input", "visual-tests__input") as HTMLInputElement
    html_x.value = "0"
    html_x.type = "number"

    const html_y = create_html_element("input", "visual-tests__input") as HTMLInputElement
    html_y.value = "0"
    html_y.type = "number"

    const html_power_sets = create_html_element("select", "visual-tests__select") as HTMLSelectElement
    html_power_sets.multiple = true
    for (const power_set of Object.values(POWER_SET)) {
        const option = document.createElement("option")
        option.value = power_set
        option.textContent = power_set
        option.selected = power_set === POWER_SET.BASIC
        html_power_sets.append(option)
    }

    const html_add_button = document.createElement("button")
    html_add_button.className = "visual-tests__button"
    html_add_button.type = "button"
    html_add_button.textContent = "Add creature"

    html_add_button.addEventListener("click", () => {
        const selected_power_sets = Array.from(html_power_sets.selectedOptions).map(option => option.value as PowerSetName)
        on_add_creature({
            name: html_name.value.trim(),
            team: html_team.value.trim() === "" ? null : Number(html_team.value),
            position: {
                x: Number(html_x.value),
                y: Number(html_y.value),
                footprint: 1,
            },
            power_sets: selected_power_sets.length > 0 ? selected_power_sets : [POWER_SET.BASIC],
        })
    })

    html_form.append(
        create_labeled_field({label: "Creature name", control: html_name}),
        create_labeled_field({label: "Team (empty = neutral)", control: html_team}),
        create_labeled_field({label: "Grid X", control: html_x}),
        create_labeled_field({label: "Grid Y", control: html_y}),
        create_labeled_field({label: "Power sets", control: html_power_sets}),
        html_add_button,
    )

    return {html_form}
}
