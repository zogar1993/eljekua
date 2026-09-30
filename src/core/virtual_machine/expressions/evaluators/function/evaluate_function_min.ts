import type {GameQueries} from "core/game_state/GameQueries";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_is_at_least} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {assert_is_not_empty} from "stdlib/assert";

export const evaluate_function_min = ({node, game_queries}: {
    node: AstNodeFunction
    game_queries: GameQueries
}): ExprNumberResolved => {
    assert_parameters_amount_is_at_least(node, 1)

    const values = node.parameters.map(parameter => game_queries.evaluate(parameter))

    const results: Array<ExprNumberResolved> = []
    for (const value of values)
        results.push(...EXPR.as_numbers_resolved_expr(value))

    assert_is_not_empty(results)

    return {
        type: "number_resolved",
        value: Math.min(...results.map(number => number.value)),
        description: "min",
        params: results,
    }
}
