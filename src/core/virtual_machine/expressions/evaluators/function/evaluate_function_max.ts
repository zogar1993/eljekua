import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {evaluate_ast} from "core/virtual_machine/expressions/evaluators/evaluate_ast";
import {assert_parameters_amount_is_at_least} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {assert_is_not_empty} from "stdlib/assert";

export const evaluate_function_max = ({node, game_state}: EvaluateFunctionProps): ExprNumberResolved => {
    assert_parameters_amount_is_at_least(node, 1)

    const values = node.parameters.map(parameter => evaluate_ast({node: parameter, game_state}))

    const results: Array<ExprNumberResolved> = []
    for (const value of values)
        results.push(...EXPR.as_numbers_resolved_expr(value))

    assert_is_not_empty(results)

    return {
        type: "number_resolved",
        value: Math.max(...results.map(number => number.value)),
        description: "max",
        params: results,
    }
}
