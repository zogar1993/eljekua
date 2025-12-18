import {CreatureVisual} from "scripts/battlegrid/creatures/CreatureVisual";
import {CreatureData} from "scripts/battlegrid/creatures/CreatureData";
import {AnimationQueue} from "scripts/AnimationQueue";
import type {ExprNumberResolved} from "scripts/expressions/evaluator/types";
import {ActionType} from "scripts/battlegrid/creatures/ActionType";

export class Creature {
    visual: CreatureVisual
    data: CreatureData
    statuses: Array<Status> = []
    available_actions: Array<ActionType> = []

    constructor({data, visual}: { data: CreatureData, visual: CreatureVisual }) {
        this.data = data
        this.visual = visual
    }

    receive_damage(value: number) {
        this.data.hp_current -= value
        AnimationQueue.add_animation(() => this.visual.receive_damage({hp: this.data.hp_current, damage: value}))
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
        for(const status of this.statuses)
            if (!status.durations.some((d) => d.until == type && d.creature === undefined || d.creature === creature))
                new_statuses.push(status)

        this.statuses = new_statuses
    }

    set_available_actions = (actions: Array<ActionType>) => {
        this.available_actions = [...actions]
    }

    has_action_available = (type: ActionType) => {
        return this.available_actions.some(available_action => available_action === type)
    }

    expend_action = (action: ActionType) => {
        const index = this.available_actions.indexOf(action)
        if (index === -1) throw Error(`Expected "${action}" to be available for "${this.data.name}"`)
        //TODO AP4 check splice occurrences and mutations
        this.available_actions.splice(index)
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