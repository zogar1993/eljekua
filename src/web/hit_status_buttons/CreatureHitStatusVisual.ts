import type {HitStatus} from "core/virtual_machine/expressions/constants/HitStatus";
import {HIT_STATUS} from "core/virtual_machine/expressions/constants/HitStatus";
import {create_html_element} from "web/utils/create_html_element";
import {assert_is_not_null} from "stdlib/assert";

const HIT_STATUS_OPTIONS: Array<{ status: HitStatus, label: string }> = [
    {status: HIT_STATUS.MISS, label: "Miss"},
    {status: HIT_STATUS.HIT, label: "Hit"},
    {status: HIT_STATUS.CRIT, label: "Crit"},
]

export const create_creature_hit_status_visual = ({creature_id, on_status_change}: {
    creature_id: number
    on_status_change: (status: HitStatus) => void
}): CreatureHitStatusVisual => {
    const html_creature = document.getElementById(`creature-${creature_id}`)
    assert_is_not_null(html_creature)

    const container = create_html_element("div", "hit-status-buttons")
    html_creature.appendChild(container)

    const buttons = HIT_STATUS_OPTIONS.map(({status, label}) => {
        const button = create_html_element("button", "hit-status-button")
        button.textContent = label
        button.addEventListener("click", () => on_status_change(status))
        container.appendChild(button)
        return {status, button}
    })

    const set_selected = (status: HitStatus) => {
        for (const {status: button_status, button} of buttons)
            button.classList.toggle("hit-status-button--selected", button_status === status)
    }

    return {
        set_selected,
        remove: () => container.remove(),
    }
}

export type CreatureHitStatusVisual = {
    set_selected: (status: HitStatus) => void
    remove: () => void
}
