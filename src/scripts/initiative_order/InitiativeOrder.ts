import {Creature} from "scripts/battlegrid/creatures/Creature";
import {roll_d} from "scripts/randomness/dice";
import {InitiativeOrderVisual} from "scripts/initiative_order/InitiativeOrderVisual";
import {ExprNumberResolved} from "scripts/expressions/evaluator/types";

export const create_initiative_order = ({visual_initiative_order}: {
    visual_initiative_order: InitiativeOrderVisual
}) => {
    let initiative_order: Array<{ creature: Creature, initiative: ExprNumberResolved, visual: HTMLDivElement }> = []

    let current_index = 0


    const add_creature = (creature: Creature) => {
        const initiative = roll_d(20)
        const visual_creature = visual_initiative_order.create_creature({creature, initiative})
        initiative_order.push({creature, initiative, visual: visual_creature})
    }

    const get_current_creature = (): Creature => {
        if (current_index >= initiative_order.length)
            throw Error(`Initiative index ${current_index} out of bounds`)
        return initiative_order[current_index].creature
    }

    const next_turn = () => {
        initiative_order[current_index].visual.removeAttribute("current-turn")
        if (current_index + 1 === initiative_order.length)
            current_index = 0
        else
            current_index++
        initiative_order[current_index].visual.setAttribute("current-turn", "")
    }

    const start = () => {
        initiative_order[current_index].visual.setAttribute("current-turn", "")

        initiative_order = initiative_order.sort((a, b) => a.initiative.value > b.initiative.value ? -1 : 1)
        initiative_order.forEach(initiative => {
            visual_initiative_order.add_creature({visual: initiative.visual})
        })
    }

    return {
        add_creature,
        get_current_creature,
        next_turn,
        start
    }
}

export type InitiativeOrder = {
    start: () => void
    add_creature: (creature: Creature) => void
    get_current_creature: () => Creature
    next_turn: () => void
}