import type {Creature} from "core/battlegrid/creatures/Creature";
import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import type {GameEvents} from "core/events/GameEvents";
import {insert_to_array} from "stdlib/insert_to_array";

export const create_initiative_order = ({game_events}: { game_events: GameEvents }) => {
    let initiatives: Array<{
        creature: Creature
        initiative: ExprNumberResolved
    }> = []
    let current_index = 0

    const add_entry = ({creature, initiative}: { creature: Creature, initiative: ExprNumberResolved }) => {
        //TODO contemplate same initiative

        let index = 0
        while (index < initiatives.length) {
            const entry = initiatives[index]
            if (initiative.value > entry.initiative.value)
                break
            index++
        }
        initiatives = insert_to_array(initiatives, {creature, initiative}, index)
        game_events.on_initiative_entry_added.raise({creature, initiative, index})
    }

    const get_current_creature = (): Creature => {
        if (current_index >= initiatives.length)
            throw Error(`Initiative index ${current_index} out of bounds`)
        return initiatives[current_index].creature
    }

    const next_turn = () => {
        if (current_index + 1 === initiatives.length)
            current_index = 0
        else
            current_index++
        game_events.on_initiative_current_creature_changed.raise(initiatives[current_index].creature)
    }

    const start = () => {
        game_events.on_initiative_current_creature_changed.raise(initiatives[current_index].creature)
    }

    const set_current_turn = (creature: Creature) => {
        current_index = initiatives.findIndex(entry => creature === entry.creature)
        game_events.on_initiative_current_creature_changed.raise(initiatives[current_index].creature)
    }

    return {
        add_entry,
        set_current_turn,
        get_current_creature,
        next_turn,
        start
    }
}

export type InitiativeOrder = ReturnType<typeof create_initiative_order>
