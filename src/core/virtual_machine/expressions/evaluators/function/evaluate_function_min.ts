import type {GameQueries} from "core/game_state/GameQueries";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";

export const evaluate_function_min = ({node, game_queries}: {
    node: AstNodeFunction
    game_queries: GameQueries
}): ExprNumberResolved => {
    assert_parameters_amount_equals(node, 1)

    const numbers = EXPR.as_numbers(game_queries.evaluate(node.parameters[0]))
    if (numbers.length === 0)
        throw Error("min requires at least one number")

    return {
        type: "number_resolved",
        value: Math.min(...numbers.map(number => number.value)),
        description: "min",
        params: numbers,
    }
}
