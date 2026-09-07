import type {CreatureData} from "core/battlegrid/creatures/CreatureData";
import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import type {ActionType} from "core/battlegrid/creatures/ActionType";
import {ACTION_TYPE_EXPENDITURE_ORDER} from "core/battlegrid/creatures/ActionType";
import {remove_from_array_by_index} from "stdlib/remove_from_array_by_index";

export class Creature {
    id: number
    data: CreatureData
    statuses: Array<Status> = []
    available_actions: Array<ActionType> = []

    constructor({id, data}: { id: number, data: CreatureData }) {
        this.data = data
        this.id = id
    }
}

//P1 add weapon types
export const has_creature_equipped = ({creature, weapon_type}: { creature: Creature, weapon_type: string }) => false

export const get_creature_half_level = ({creature}: { creature: Creature }) =>
    Math.floor(creature.data.level / 2)

export const get_creature_attribute_mod = ({creature, attribute_code}: {
    creature: Creature,
    attribute_code: keyof Creature["data"]["attributes"]
}) =>
    Math.floor((creature.data.attributes[attribute_code] - 10) / 2)

export const add_creature_status = ({creature, status}: { creature: Creature, status: Status }) => {
    creature.statuses.push(status)
}

export const remove_creature_statuses = ({creature, type, until_creature}: {
    creature: Creature,
    type: StatusDuration["until"],
    until_creature: Creature | undefined
}) => {
    const new_statuses: Array<Status> = []
    for (const status of creature.statuses)
        if (!status.durations.some((d) => d.until == type && d.creature === undefined || d.creature === until_creature))
            new_statuses.push(status)

    creature.statuses = new_statuses
}

export const has_creature_action_available = ({creature, action}: { creature: Creature, action: ActionType }) => {
    for (const expenditure of ACTION_TYPE_EXPENDITURE_ORDER[action])
        if (creature.available_actions.some(available => available === expenditure))
            return true
    return false
}

export const expend_creature_action = ({creature, action}: { creature: Creature, action: ActionType }) => {
    for (const expenditure of ACTION_TYPE_EXPENDITURE_ORDER[action]) {
        const index = creature.available_actions.indexOf(expenditure)

        if (index >= 0) {
            creature.available_actions = remove_from_array_by_index(creature.available_actions, index)
            return
        }
    }
    throw Error(`Expected "${action}" to be available for "${creature.data.name}"`)
}

export const restore_creature_actions = ({creature, actions}: {creature: Creature, actions: Array<ActionType>}) => {
    for (const action of actions)
        if (!creature.available_actions.includes(action))
            creature.available_actions.push(action)
}

export type Status = { durations: Array<StatusDuration> } & { effect: StatusEffect }

export type StatusDuration = {
    until: "next_turn_end" | "turn_start" | "turn_end" | "next_attack_roll_against_target",
    creature?: Creature
}

export type StatusEffect =
    StatusEffectGrantCombatAdvantage |
    StatusEffectGainResistance |
    StatusEffectGainAttackBonus

export type StatusEffectGrantCombatAdvantage = {
    type: "grant_combat_advantage",
    against: Array<Creature>,
}

export type StatusEffectGainResistance = {
    type: "gain_resistance"
    value: ExprNumberResolved
    against: Array<Creature>,
}

export type StatusEffectGainAttackBonus = {
    type: "gain_attack_bonus"
    value: ExprNumberResolved
    against: Array<Creature>,
}