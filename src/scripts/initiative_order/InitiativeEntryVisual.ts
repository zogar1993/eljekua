import {Creature} from "scripts/battlegrid/creatures/Creature";
import {ExprNumberResolved} from "scripts/expressions/evaluator/types";

export const create_initiative_entry_visual = ({creature, initiative, index}: {
    creature: Creature,
    initiative: ExprNumberResolved,
    index: number
}): InitiativeEntryVisual => {
    const html_initiative_order = document.getElementById("initiative_order")!
    if (html_initiative_order.children.length > index)
        throw new AssertionError("create_visual_initiative_order must never be called with an index higher than its length")

    const html_creature_initiative = document.createElement("div")

    const html_initiative_name = document.createElement("span")
    html_initiative_name.textContent = creature.data.name
    html_creature_initiative.appendChild(html_initiative_name)

    const html_initiative_number = document.createElement("span")
    html_initiative_number.textContent = ` ${initiative.value}`
    html_creature_initiative.appendChild(html_initiative_number)

    html_creature_initiative.setAttribute("creature-id", creature.data.name.toLowerCase())

    if (html_initiative_order.children.length === index)
        html_initiative_order.appendChild(html_creature_initiative)
    else if (html_initiative_order.children.length < index)
        html_initiative_order.insertBefore(html_creature_initiative, html_creature_initiative.children[index])

    return {
        set_current_turn: (value: boolean) => {
            if (value)
                html_creature_initiative.setAttribute("current-turn", "")
            else
                html_creature_initiative.removeAttribute("current-turn")
        }
    }
}

export type InitiativeEntryVisual = {
    set_current_turn: (value: boolean) => void
}