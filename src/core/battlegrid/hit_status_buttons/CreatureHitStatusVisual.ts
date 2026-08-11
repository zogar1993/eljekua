import {Creature} from "core/battlegrid/creatures/Creature";
import {HIT_STATUS, HitStatus} from "core/battlegrid/player_turn_handler/HitStatus";
import {create_html_element} from "web/utils/create_html_element";

const HIT_STATUS_OPTIONS: Array<{ status: HitStatus, label: string }> = [
    {status: HIT_STATUS.MISS, label: "Miss"},
    {status: HIT_STATUS.HIT, label: "Hit"},
    {status: HIT_STATUS.CRIT, label: "Crit"},
]

export const create_creature_hit_status_visual = ({
                                                    creature,
                                                    current_status,
                                                    on_status_change,
                                                }: {
    creature: Creature
    current_status: HitStatus
    on_status_change: (status: HitStatus) => void
}): CreatureHitStatusVisual => {
    const html_creature = document.getElementById(creature.data.name.toLowerCase())
    if (!html_creature) throw Error(`Creature element not found for "${creature.data.name}"`)

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

    set_selected(current_status)

    return {
        set_selected,
        remove: () => container.remove(),
    }
}

export type CreatureHitStatusVisual = {
    set_selected: (status: HitStatus) => void
    remove: () => void
}
