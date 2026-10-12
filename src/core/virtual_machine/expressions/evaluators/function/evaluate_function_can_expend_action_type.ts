import {has_creature_action_available} from "core/battlegrid/creatures/Creature";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {evaluate_ast} from "core/virtual_machine/expressions/evaluators/evaluate_ast";
import type {ExprBoolean} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {assert_is_action_type} from "core/battlegrid/creatures/ActionType";

export const evaluate_function_can_expend_action_type = ({node, game_state}: EvaluateFunctionProps): ExprBoolean => {
    assert_parameters_amount_equals(node, 2)

    const creature = EXPR.as_creature(evaluate_ast({node: node.parameters[0], game_state}))
    const action_type = EXPR.as_string(evaluate_ast({node: node.parameters[1], game_state}))
    assert_is_action_type(action_type)

    return {
        type: "boolean",
        value: has_creature_action_available({creature, action: action_type}),
        description: "has action available"
    }
}