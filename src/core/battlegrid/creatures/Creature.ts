import {CreatureData} from "core/battlegrid/creatures/CreatureData";
import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import {ACTION_TYPE_EXPENDITURE_ORDER, ActionType} from "core/battlegrid/creatures/ActionType";
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

    //P1 add weapon types
    has_equipped = (weapon_type: string) => false

    half_level = () =>
        Math.floor(this.data.level / 2)

    attribute_mod = (attribute_code: keyof Creature["data"]["attributes"]) =>
        Math.floor((this.data.attributes[attribute_code] - 10) / 2)

    add_status(status: Status) {
        this.statuses.push(status)
    }

    remove_statuses = ({type, creature}: { type: StatusDuration["until"], creature: Creature | undefined }) => {
        const new_statuses: Array<Status> = []
        for (const status of this.statuses)
            if (!status.durations.some((d) => d.until == type && d.creature === undefined || d.creature === creature))
                new_statuses.push(status)

        this.statuses = new_statuses
    }

    restore_actions = (actions: Array<ActionType>) => {
        for (const action of actions)
            if (!this.available_actions.includes(action))
                this.available_actions.push(action)
    }

    has_action_available = (action: ActionType) => {
        for (const expenditure of ACTION_TYPE_EXPENDITURE_ORDER[action])
            if (this.available_actions.some(available => available === expenditure))
                return true
        return false
    }

    expend_action = (action: ActionType) => {
        for (const expenditure of ACTION_TYPE_EXPENDITURE_ORDER[action]) {
            const index = this.available_actions.indexOf(expenditure)

            if (index >= 0) {
                this.available_actions = remove_from_array_by_index(this.available_actions, index)
                return
            }
        }
        throw Error(`Expected "${action}" to be available for "${this.data.name}"`)
    }
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