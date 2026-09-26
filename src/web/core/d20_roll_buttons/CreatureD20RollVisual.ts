import {create_html_element} from "web/core/utils/create_html_element";
import {assert_is_not_null} from "stdlib/assert";

const DEFAULT_D20_VALUE = 10
const MIN_D20_VALUE = 1
const MAX_D20_VALUE = 20

const clamp_d20_value = (value: number) => Math.min(MAX_D20_VALUE, Math.max(MIN_D20_VALUE, value))

export const create_creature_d20_roll_visual = ({creature_id, on_roll_change}: {
    creature_id: number
    on_roll_change: (value: number) => void
}): CreatureD20RollVisual => {
    const html_creature = document.getElementById(`creature-${creature_id}`)
    assert_is_not_null(html_creature)
    html_creature.classList.add("creature--d20-roll-select")

    const container = create_html_element("div", "d20-roll-buttons")
    html_creature.appendChild(container)

    const input_box = create_html_element("div", "d20-roll-input-box")
    const input = create_html_element("input", "d20-roll-input") as HTMLInputElement
    input.type = "number"
    input.min = `${MIN_D20_VALUE}`
    input.max = `${MAX_D20_VALUE}`
    input.value = `${DEFAULT_D20_VALUE}`
    input_box.appendChild(input)
    container.appendChild(input_box)

    const submit_value = () => {
        const value = clamp_d20_value(Number(input.value))
        input.value = `${value}`
        input_box.classList.add("d20-roll-input-box--selected")
        on_roll_change(value)
    }

    input.addEventListener("change", submit_value)
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter")
            submit_value()
    })

    return {
        focus: () => {
            input.focus()
            input.select()
        },
        set_selected: (value: number) => {
            input.value = `${clamp_d20_value(value)}`
            input_box.classList.add("d20-roll-input-box--selected")
        },
        remove: () => {
            container.remove()
            html_creature.classList.remove("creature--d20-roll-select")
        },
    }
}

export type CreatureD20RollVisual = {
    focus: () => void
    set_selected: (value: number) => void
    remove: () => void
}
