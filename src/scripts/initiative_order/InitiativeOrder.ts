import {Creature} from "scripts/battlegrid/creatures/Creature";
import {roll_d} from "scripts/randomness/dice";
import {CreatureInitiativeVisual, InitiativeOrderVisual} from "scripts/initiative_order/InitiativeOrderVisual";
import {ExprNumberResolved} from "scripts/expressions/evaluator/types";
import {insert_to_array} from "scripts/ts_utils/insert_to_array";

export const create_initiative_order = ({visual_initiative_order}: {
    visual_initiative_order: InitiativeOrderVisual
}) => {
    let initiatives: Array<{
        creature: Creature,
        initiative: ExprNumberResolved,
        visual: CreatureInitiativeVisual
    }> = []
    let current_index = 0

    const add_creature = (creature: Creature) => {
        //TODO contemplate current creature changing mid turn?
        //TODO contemplate same initiative
        const initiative = roll_d(20)

        let index = 0
        while (index < initiatives.length) {
            const entry = initiatives[index]
            if (initiative.value > entry.initiative.value)
                break
            index++
        }
        const visual_creature = visual_initiative_order.create_creature({creature, initiative, index})
        const new_entry = {creature, initiative, visual: visual_creature}
        insert_to_array(initiatives, new_entry, index)
    }

    const get_current_creature = (): Creature => {
        if (current_index >= initiatives.length)
            throw Error(`Initiative index ${current_index} out of bounds`)
        return initiatives[current_index].creature
    }

    const next_turn = () => {
        initiatives[current_index].visual.set_current_turn(false)
        if (current_index + 1 === initiatives.length)
            current_index = 0
        else
            current_index++
        initiatives[current_index].visual.set_current_turn(true)
    }

    const start = () => {
        initiatives[current_index].visual.set_current_turn(true)
    }

    return {
        add_creature,
        get_current_creature,
        next_turn,
        start
    }
}

export type InitiativeOrder = {
    add_creature: (creature: Creature) => void
    get_current_creature: () => Creature
    next_turn: () => void
    start: () => void
}