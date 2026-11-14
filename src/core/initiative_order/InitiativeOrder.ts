import type {Creature} from "core/battlegrid/creatures/Creature";
import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import type {GameEvents} from "core/events/GameEvents";
import {insert_to_array} from "stdlib/insert_to_array";
import {assert_is_not_empty, assert_is_valid_index} from "stdlib/assert";
import {get_creature_initiative_modifier} from "core/character_sheet/get_creature_initiative_modifier";
import {
    add_numbers_resolved,
    multiply_numbers_resolved,
    number_resolved
} from "core/virtual_machine/expressions/number_utils";

type InitiativeEntry = {
    creature: Creature
    initiative: ExprNumberResolved
}

const find_insert_index = ({initiatives, initiative}: {
    initiatives: Array<InitiativeEntry>
    initiative: ExprNumberResolved
}) => {
    for (let index = 0; index < initiatives.length; index++)
        if (initiative.value > initiatives[index].initiative.value)
            return index
    return initiatives.length
}

export const create_initiative_order = ({game_events}: { game_events: GameEvents }) => {
    let initiatives: Array<InitiativeEntry> = []
    let current_index = 0

    const add_entry = ({creature, initiative_roll}: {
        creature: Creature
        initiative_roll: ExprNumberResolved
    }) => {
        const initiative_modifier = number_resolved(get_creature_initiative_modifier(creature) * 0.01)
        const initiative = add_numbers_resolved([initiative_roll, initiative_modifier])
        const index = find_insert_index({initiatives, initiative})

        initiatives = insert_to_array(initiatives, {creature, initiative}, index)

        game_events.on_initiative_entry_added.raise({creature, initiative, index})
    }

    const get_current_creature = (): Creature => {
        assert_is_valid_index(current_index, initiatives)
        return initiatives[current_index].creature
    }

    const next_turn = () => {
        assert_is_not_empty(initiatives)
        if (current_index + 1 === initiatives.length)
            current_index = 0
        else
            current_index++
        game_events.on_initiative_current_creature_changed.raise(initiatives[current_index].creature)
    }

    const start = () => {
        assert_is_not_empty(initiatives)
        game_events.on_initiative_current_creature_changed.raise(initiatives[current_index].creature)
    }

    const set_current_turn = (creature: Creature) => {
        const index = initiatives.findIndex(entry => creature === entry.creature)
        assert_is_valid_index(index, initiatives)
        current_index = index
        game_events.on_initiative_current_creature_changed.raise(initiatives[current_index].creature)
    }

    return {
        add_entry,
        set_current_turn,
        get_current_creature,
        next_turn,
        start,
    }
}

export type InitiativeOrder = ReturnType<typeof create_initiative_order>