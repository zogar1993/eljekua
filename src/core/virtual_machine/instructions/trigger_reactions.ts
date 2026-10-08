import type {GameQueries} from "core/game_state/GameQueries";
import type {GameState} from "core/game_state/GameState";
import {type Creature, has_creature_action_available} from "core/battlegrid/creatures/Creature";
import type {Power, TriggerInterception, TriggerTiming} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import type {Expr} from "core/virtual_machine/expressions/types";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import {type Instruction, INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";
import type {ActionType} from "core/battlegrid/creatures/ActionType";
import {ACTION_TYPE} from "core/battlegrid/creatures/ActionType";

export const TRIGGER_VARIABLE = {
    ACTIVATOR: "trigger_activator",
    OWNER: "trigger_owner",
} as const

export const get_potential_triggers = ({
                                           game_state,
                                           game_queries,
                                           activator,
                                           intercept,
                                           timing,
                                       }: {
    game_state: GameState
    game_queries: GameQueries
    activator: Creature
    intercept: TriggerInterception
    timing: TriggerTiming
}): Array<{ creature: Creature, powers: Array<Power> }> => {
    const {vm_state, initiative_order, creatures} = game_state
    // We exclude the ones who already were triggered for this power.
    // This is a little redundant in most cases, but without it, we wouldn't
    // disregard those who ignored the chance to use the trigger.
    const already_triggered_key = `already_triggered_${intercept}`
    const already_triggered = vm_state.has_variable(already_triggered_key) ?
        EXPR.as_creatures(vm_state.get_variable(already_triggered_key)) : []

    vm_state.set_variable(TRIGGER_VARIABLE.ACTIVATOR, {type: "creatures", value: [activator]})

    const current_turn_creature = initiative_order.get_current_creature()
    const trigger_owners = creatures.get_all()
        .filter(creature => !already_triggered.includes(creature))
        .map(creature => {
            // TODO this is ugly since it mutates inside of a query
            vm_state.set_variable(TRIGGER_VARIABLE.OWNER, {type: "creatures", value: [creature]})
            const powers = creature.data.powers.filter(power => {
                if (!power.trigger) return false
                if (!power.trigger.intercepts.includes(intercept)) return false
                if (power.trigger.type !== timing) return false
                if (!can_use_power_on_own_turn(power) && creature === current_turn_creature) return false
                if (!has_creature_action_available({creature, action: power.type.action})) return false
                return power.trigger.conditions.every(condition => EXPR.as_boolean(game_queries.evaluate(condition)))
            })
            return {creature, powers}
        })
        .filter(({powers}) => powers.length > 0)

    const new_already_triggered = [...already_triggered, ...trigger_owners.map(({creature}) => creature)]
    vm_state.set_variable(already_triggered_key, {type: "creatures", value: new_already_triggered})

    return trigger_owners
}

export const offer_trigger_reactions = ({
                                            game_state,
                                            game_queries,
                                            activator,
                                            intercept,
                                            timing,
                                            before_offering_triggers,
                                        }: {
    game_state: GameState
    game_queries: GameQueries
    activator: Creature
    intercept: TriggerInterception
    timing: TriggerTiming
    before_offering_triggers?: () => void
}): void => {
    const potential_triggers = get_potential_triggers({
        game_state,
        game_queries,
        activator,
        intercept,
        timing,
    })

    if (potential_triggers.length === 0) return

    before_offering_triggers?.()

    for (const {creature: trigger_owner, powers} of potential_triggers) {
        const frame = create_trigger_frame({activator, trigger_owner, powers})
        game_state.vm_state.add_scoped_instruction_frame(frame)
    }
}

export const create_trigger_frame = ({activator, trigger_owner: creature, powers}: {
    activator: Creature
    trigger_owner: Creature
    powers: Array<Power>
}): { instructions: Array<Instruction>; variables: Record<string, Expr> } => ({
    instructions: [{
        type: INSTRUCTION_TYPE.OPTIONS,
        options: [
            ...powers.map(power => ({
                text: power.name,
                instructions: power.instructions
            })),
            {
                text: "Ignore",
                instructions: []
            }
        ]
    }],
    variables: {
        [SYSTEM_KEYWORD.OWNER]: {type: "creatures", value: [creature]},
        [SYSTEM_KEYWORD.TRIGGERER]: {type: "creatures", value: [activator]}
    }
})

const OTHER_TURN_ACTIONS: Array<ActionType> = [ACTION_TYPE.OPPORTUNITY, ACTION_TYPE.IMMEDIATE] as const
const can_use_power_on_own_turn = (power: Power) => !OTHER_TURN_ACTIONS.includes(power.type.action)