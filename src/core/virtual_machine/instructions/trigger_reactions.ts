import type {GameState} from "core/game_state/GameState";
import type {Creature} from "core/battlegrid/creatures/Creature";
import type {TurnState} from "core/battlegrid/player_turn_handler/TurnState";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import {
    Power,
    TRIGGER_INTERCEPTION,
    TriggerInterception
} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import type {Expr} from "core/virtual_machine/expressions/types";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";
import {ACTION_TYPE, ActionType} from "core/battlegrid/creatures/ActionType";

export const TRIGGER_VARIABLE = {
    ACTIVATOR: "trigger_activator",
    OWNER: "trigger_owner",
} as const

export const get_potential_triggers = ({
                                           game_state,
                                           evaluate_ast,
                                           activator,
                                           intercept,
                                       }: {
    game_state: GameState
    evaluate_ast: (node: AstNode) => Expr
    activator: Creature
    intercept: TriggerInterception
}): Array<{ creature: Creature, powers: Array<Power> }> => {
    const {battle_grid, turn_state, initiative_order} = game_state
    // We exclude the ones who already were triggered for this power.
    // This is a little redundant in most cases, but without it, we wouldn't
    // disregard those who ignored the chance to use the trigger.
    const already_triggered_key = `already_triggered_${TRIGGER_INTERCEPTION.MOVEMENT}`
    const already_triggered = turn_state.has_variable(already_triggered_key) ?
        EXPR.as_creatures(turn_state.get_variable(already_triggered_key)) : []

    turn_state.set_variable(TRIGGER_VARIABLE.ACTIVATOR, {type: "creatures", value: [activator]})

    const current_turn_creature = initiative_order.get_current_creature()
    const trigger_owners = battle_grid.creatures
        .filter(creature => !already_triggered.includes(creature))
        .map(creature => {
            turn_state.set_variable(TRIGGER_VARIABLE.OWNER, {type: "creatures", value: [creature]})
            const powers = creature.data.powers.filter(power => {
                if (!power.trigger) return false
                if (!power.trigger.intercepts.includes(intercept)) return false
                if (!can_use_power_on_own_turn(power) && creature === current_turn_creature) return false
                if (!creature.has_action_available(power.type.action)) return false
                return power.trigger.conditions.every(condition => EXPR.as_boolean(evaluate_ast(condition)))
            })
            return {creature, powers}
        })
        .filter(({powers}) => powers.length > 0)

    const new_already_triggered = [...already_triggered, ...trigger_owners.map(({creature}) => creature)]
    turn_state.set_variable(already_triggered_key, {type: "creatures", value: new_already_triggered})

    return trigger_owners
}

export const create_trigger_frame = ({activator, trigger_owner: creature, powers}: {
    activator: Creature
    trigger_owner: Creature
    powers: Array<Power>
}): Parameters<TurnState["add_instruction_frame"]>[0] => ({
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