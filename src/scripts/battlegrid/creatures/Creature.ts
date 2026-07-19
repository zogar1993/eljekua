import {CreatureData} from "scripts/battlegrid/creatures/CreatureData";
import type {ExprNumberResolved} from "scripts/expressions/evaluator/types";
import {ACTION_TYPE_EXPENDITURE_ORDER, ActionType} from "scripts/battlegrid/creatures/ActionType";
import {remove_from_array_by_index} from "scripts/ts_utils/remove_from_array_by_index";
import {Position} from "scripts/battlegrid/Position";

type EventHandlerMoved = {position: Position, movement_type: "move" | "push"};
type EventHandlerReceivedDamage = {hp: number, damage: number};
type EventHandlerIsTargeted = {attack: number, defense: number, chance: number};

type EventHandler<T> = (_: T) => void;

type EventManagerWithParams<T> = { raise: (props: T) => void, add_handler: (handler: EventHandler<T>) => void }

const create_event_with_params = <T>(): EventManagerWithParams<T> => {
    const handlers: Array<EventHandler<T>> = []

    return {
            raise: (props: T) => {
                for(const handler of handlers)
                    handler(props)
            },
            add_handler: (handler: EventHandler<T>) => {
                handlers.push(handler)
            }
    }
}

type EventManagerWithoutParams = { raise: () => void, add_handler: (handler: () => void) => void }
const create_event_without_params = (): EventManagerWithoutParams => {
    const handlers: Array<() => void> = []

    return {
            raise: () => {
                for(const handler of handlers)
                    handler()
            },
            add_handler: (handler: () => void) => {
                handlers.push(handler)
            }
    }
}

export class Creature {
    data: CreatureData
    statuses: Array<Status> = []
    available_actions: Array<ActionType> = []

    events = {
        moved: create_event_with_params<EventHandlerMoved>(),
        received_damage: create_event_with_params<EventHandlerReceivedDamage>(),
        is_targeted: create_event_with_params<EventHandlerIsTargeted>(),
        is_untargeted: create_event_without_params(),
        is_missed: create_event_without_params(),
    }

    constructor({data}: { data: CreatureData }) {
        this.data = data
    }

    receive_damage(value: number) {
        this.data.hp_current -= value
        this.events.received_damage.raise({hp: this.data.hp_current, damage: value})
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

    set_available_actions = (actions: Array<ActionType>) => {
        this.available_actions = [...actions]
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