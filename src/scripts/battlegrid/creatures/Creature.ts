import {CreatureVisual} from "scripts/battlegrid/creatures/CreatureVisual";
import {CreatureData} from "scripts/battlegrid/creatures/CreatureData";
import {AnimationQueue} from "scripts/AnimationQueue";
import type {AstNodeNumberResolved} from "scripts/expressions/token_evaluator/types";

export class Creature {
    visual: CreatureVisual
    data: CreatureData
    statuses: Array<Status> = []

    constructor({data, visual}: { data: CreatureData, visual: CreatureVisual }) {
        this.data = data
        this.visual = visual
    }

    receive_damage(value: number) {
        this.data.hp_current -= value
        AnimationQueue.add_animation(() => this.visual.receive_damage({hp: this.data.hp_current, damage: value}))
    }

    display_hit_chance_on_hover = ({attack, defense, chance}: { attack: number, defense: number, chance: number }) => {
        this.visual.display_hit_chance({attack, defense, chance})
    }

    has_equipped = (weapon_type: string) => false

    half_level = () =>
        Math.floor(this.data.level / 2)

    attribute_mod = (attribute_code: keyof Creature["data"]["attributes"]) =>
        Math.floor((this.data.attributes[attribute_code] - 10) / 2)

    add_status(status: Status) {
        this.statuses.push(status)
    }

    remove_statuses = ({type, creature}: { type: StatusDuration["until"], creature: Creature | undefined }) => {
        this.statuses = this.statuses.filter(
            ({durations}) => durations.every(duration => !(duration.until === type && duration.creature === creature))
        )
    }

    has_opportunity_action = () => {
        return !this.statuses.some(({effect}) => effect.type === "opportunity_action_used")
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
    StatusEffectGainAttackBonus |
    StatusEffectOpportunityAttackUsed

export type StatusEffectGrantCombatAdvantage = {
    type: "grant_combat_advantage",
    against: Array<Creature>,
}

export type StatusEffectGainResistance = {
    type: "gain_resistance"
    value: AstNodeNumberResolved
    against: Array<Creature>,
}

export type StatusEffectGainAttackBonus = {
    type: "gain_attack_bonus"
    value: AstNodeNumberResolved
    against: Array<Creature>,
}

export type StatusEffectOpportunityAttackUsed = {
    type: "opportunity_action_used"
}
