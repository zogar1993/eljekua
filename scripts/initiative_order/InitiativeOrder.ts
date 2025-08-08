import {Creature} from "battlegrid/creatures/Creature";
import type {AstNodeNumberResolved} from "expression_parsers/token_to_node";
import {roll_d} from "randomness/dice";

export class InitiativeOrder {
    initiative_order: Array<{ creature: Creature, initiative: AstNodeNumberResolved, visual: HTMLDivElement }> = []

    private current_index = 0

    add_creature = (creature: Creature) => {
        const initiative = roll_d(20)

        //TODO decouple from logic
        const html_initiative = document.createElement("div")

        const html_initiative_name = document.createElement("span")
        html_initiative_name.textContent = creature.data.name
        html_initiative.appendChild(html_initiative_name)

        const html_initiative_number = document.createElement("span")
        html_initiative_number.textContent = ` ${initiative.value}`
        html_initiative.appendChild(html_initiative_number)

        html_initiative.setAttribute("creature-id", creature.data.name.toLowerCase())

        this.initiative_order.push({creature, initiative, visual: html_initiative})
    }

    get_current_creature = (): Creature => {
        if (this.current_index >= this.initiative_order.length)
            throw Error(`Initiative index ${this.current_index} out of bounds`)
        return this.initiative_order[this.current_index].creature
    }

    next_turn = () => {
        this.initiative_order[this.current_index].visual.removeAttribute("current-turn")
        if (this.current_index + 1 === this.initiative_order.length)
            this.current_index = 0
        else
            this.current_index++
        this.initiative_order[this.current_index].visual.setAttribute("current-turn", "")
    }

    start = () => {
        this.initiative_order[this.current_index].visual.setAttribute("current-turn", "")

        this.initiative_order = this.initiative_order.sort((a, b) => a.initiative.value > b.initiative.value ? -1 : 1)
        this.initiative_order.forEach(initiative => {
            const html_initiative_order = document.getElementById("initiative_order")!
            html_initiative_order.appendChild(initiative.visual)
        })
    }
}