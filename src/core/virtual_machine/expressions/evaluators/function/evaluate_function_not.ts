import type {ExprBoolean} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";

export const evaluate_function_not = ({node, game_state, game_queries}: EvaluateFunctionProps): ExprBoolean => {
    assert_parameters_amount_equals(node, 1)

    const parameter = game_queries.evaluate(node.parameters[0])
    const value = !game_queries.evaluate_boolean(parameter)

    return {
        type: "boolean",
        value,
        description: "not",
        params: [parameter]
    }
}
