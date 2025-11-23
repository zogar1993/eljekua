import {Creature} from "scripts/battlegrid/creatures/Creature";
import {roll_d} from "scripts/randomness/dice";
import {InitiativeOrderVisual} from "scripts/initiative_order/InitiativeOrderVisual";
import {ExprNumberResolved} from "scripts/expressions/token_evaluator/types";

export class InitiativeOrder {
    initiative_order: Array<{ creature: Creature, initiative: ExprNumberResolved, visual: HTMLDivElement }> = []
    visual_initiative_order: InitiativeOrderVisual

    private current_index = 0

    constructor(visual: InitiativeOrderVisual) {
        this.visual_initiative_order = visual
    }

    add_creature = (creature: Creature) => {
        const initiative = roll_d(20)
        const visual = this.visual_initiative_order.create_creature({creature, initiative})
        this.initiative_order.push({creature, initiative, visual})
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
            this.visual_initiative_order.add_creature({visual: initiative.visual})
        })
    }
}