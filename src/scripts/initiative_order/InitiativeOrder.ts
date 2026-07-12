import {Creature} from "scripts/battlegrid/creatures/Creature";
import {ExprNumberResolved} from "scripts/expressions/evaluator/types";
import {insert_to_array} from "scripts/ts_utils/insert_to_array";
import {InitiativeEntryVisual} from "scripts/initiative_order/InitiativeEntryVisual";

export const create_initiative_order = ({create_initiative_entry_visual}: {
    create_initiative_entry_visual: (props: {
        creature: Creature,
        initiative: ExprNumberResolved,
        index: number
    }) => InitiativeEntryVisual
}): InitiativeOrder => {
    let initiatives: Array<{
        creature: Creature,
        initiative: ExprNumberResolved,
        visual: InitiativeEntryVisual
    }> = []
    let current_index = 0

    const add_entry = ({creature, initiative}: {creature: Creature, initiative: ExprNumberResolved}) => {
        //TODO contemplate same initiative

        let index = 0
        while (index < initiatives.length) {
            const entry = initiatives[index]
            if (initiative.value > entry.initiative.value)
                break
            index++
        }
        const visual_initiative_entry = create_initiative_entry_visual({creature, initiative, index})
        const new_entry = {creature, initiative, visual: visual_initiative_entry}
        initiatives = insert_to_array(initiatives, new_entry, index)
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

    const set_current_turn = (creature: Creature) => {
        const index = initiatives.findIndex(entry => creature === entry.creature)
        initiatives[current_index].visual.set_current_turn(false)
        current_index = index
        initiatives[current_index].visual.set_current_turn(false)
    }

    return {
        add_entry,
        set_current_turn,
        get_current_creature,
        next_turn,
        start
    }
}

export type InitiativeOrder = {
    add_entry: (props: {creature: Creature, initiative: ExprNumberResolved}) => void
    set_current_turn: (creature: Creature) => void
    get_current_creature: () => Creature
    next_turn: () => void
    start: () => void
}