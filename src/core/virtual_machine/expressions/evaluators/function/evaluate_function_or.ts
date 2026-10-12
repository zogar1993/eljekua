import type {ExprBoolean} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {evaluate_ast} from "core/virtual_machine/expressions/evaluators/evaluate_ast";
import {assert_parameters_amount_is_at_least} from "core/virtual_machine/expressions/asserts";

export const evaluate_function_or = ({node, game_state}: EvaluateFunctionProps): ExprBoolean => {
    assert_parameters_amount_is_at_least(node, 2)

    const parameters = node.parameters.map(parameter => evaluate_ast({node: parameter, game_state}))

    if (!parameters.every(parameter => parameter.type === "boolean"))
        throw Error(`Expected all '$or()' parameters to evaluate to booleans, but found '${JSON.stringify(parameters)}'`)

    const result = parameters.some(parameter => parameter.value)

    return {
        type: "boolean",
        value: result,
        description: "not_equals",
        params: parameters
    }
}