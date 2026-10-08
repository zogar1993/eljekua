import type {GameQueries} from "core/game_state/GameQueries";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {Expr, ExprNumberResolved} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";

const get_array_length = (expr: Expr): number => {
    if (expr.type === "creatures") return expr.value.length
    if (expr.type === "positions") return expr.value.length
    if (expr.type === "numbers") return expr.value.length
    throw Error(`count expects an array expression but got '${expr.type}'`)
}

export const evaluate_function_count = ({node, game_queries}: {
    node: AstNodeFunction
    game_queries: GameQueries
}): ExprNumberResolved => {
    assert_parameters_amount_equals(node, 1)

    const value = get_array_length(game_queries.evaluate(node.parameters[0]))

    return {
        type: "number_resolved",
        value,
        description: "count",
    }
}
