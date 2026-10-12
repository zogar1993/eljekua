import type {Expr, ExprNumberResolved} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {evaluate_ast} from "core/virtual_machine/expressions/evaluators/evaluate_ast";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";

const get_array_length = (expr: Expr): number => {
    if (expr.type === "creatures") return expr.value.length
    if (expr.type === "positions") return expr.value.length
    if (expr.type === "numbers") return expr.value.length
    throw Error(`count expects an array expression but got '${expr.type}'`)
}

export const evaluate_function_count = ({node, game_state}: EvaluateFunctionProps): ExprNumberResolved => {
    assert_parameters_amount_equals(node, 1)

    const value = get_array_length(evaluate_ast({node: node.parameters[0], game_state}))

    return {
        type: "number_resolved",
        value,
        description: "count",
    }
}
