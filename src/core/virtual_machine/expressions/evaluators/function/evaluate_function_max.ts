import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {assert_parameters_amount_is_at_least} from "core/virtual_machine/expressions/asserts";
import {assert_is_not_empty} from "stdlib/assert";

export const evaluate_function_max = ({node, game_state, game_queries}: EvaluateFunctionProps): ExprNumberResolved => {
    assert_parameters_amount_is_at_least(node, 1)

    const values = node.parameters.map(parameter => game_queries.evaluate(parameter))

    const results: Array<ExprNumberResolved> = []
    for (const value of values)
        results.push(...game_queries.evaluate_numbers_resolved(value))

    assert_is_not_empty(results)

    return {
        type: "number_resolved",
        value: Math.max(...results.map(number => number.value)),
        description: "max",
        params: results,
    }
}
