import type {ExprBoolean} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {assert_parameters_amount_is_at_least} from "core/virtual_machine/expressions/asserts";
import {assert} from "stdlib/assert";

export const evaluate_function_or = ({node, game_state, game_queries}: EvaluateFunctionProps): ExprBoolean => {
    assert_parameters_amount_is_at_least(node, 2)

    const parameters = node.parameters.map(parameter => game_queries.evaluate(parameter))

    assert(parameters.every(parameter => parameter.type === "boolean"), () => `Expected all '$or()' parameters to evaluate to booleans, but found '${JSON.stringify(parameters)}'`)

    const result = (parameters as Array<ExprBoolean>).some(parameter => parameter.value)

    return {
        type: "boolean",
        value: result,
        description: "not_equals",
        params: parameters
    }
}