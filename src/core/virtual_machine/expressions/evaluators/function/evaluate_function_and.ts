import type {ExprBoolean} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {assert_parameters_amount_is_at_least} from "core/virtual_machine/expressions/asserts";

export const evaluate_function_and = ({node, game_state, game_queries}: EvaluateFunctionProps): ExprBoolean => {
    assert_parameters_amount_is_at_least(node, 2)

    const parameters = node.parameters.map(parameter => game_queries.evaluate(parameter))

    if (!parameters.every(parameter => parameter.type === "boolean"))
        throw Error(`Expected all '$and()' parameters to evaluate to booleans, but found '${JSON.stringify(parameters)}'`)

    const result = parameters.every(parameter => parameter.value)

    return {
        type: "boolean",
        value: result,
        description: "not_equals",
        params: parameters
    }
}