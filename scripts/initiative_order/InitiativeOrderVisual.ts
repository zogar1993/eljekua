import {Creature} from "battlegrid/creatures/Creature";

import {AstNodeNumberResolved} from "interpreter/types";

export class InitiativeOrderVisual {
    create_creature = ({creature, initiative}: { creature: Creature, initiative: AstNodeNumberResolved }) => {
        const html_initiative = document.createElement("div")

        const html_initiative_name = document.createElement("span")
        html_initiative_name.textContent = creature.data.name
        html_initiative.appendChild(html_initiative_name)

        const html_initiative_number = document.createElement("span")
        html_initiative_number.textContent = ` ${initiative.value}`
        html_initiative.appendChild(html_initiative_number)

        html_initiative.setAttribute("creature-id", creature.data.name.toLowerCase())

        return html_initiative
    }

    add_creature = ({visual}: { visual: HTMLDivElement }) => {
        const html_initiative_order = document.getElementById("initiative_order")!
        html_initiative_order.appendChild(visual)
    }
}