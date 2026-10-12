import type {ExprBoolean} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {evaluate_ast} from "core/virtual_machine/expressions/evaluators/evaluate_ast";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";

export const evaluate_function_is_greater_or_equal = ({node, game_state}: EvaluateFunctionProps): ExprBoolean => {
    assert_parameters_amount_equals(node, 2)

    const parameters = node.parameters.map(parameter => evaluate_ast({node: parameter, game_state}))

    const a = EXPR.as_number(parameters[0])
    const b = EXPR.as_number(parameters[1])
    return {
        type: "boolean",
        value: a >= b,
        description: ">=",
        params: parameters
    }
}