import type {GameQueries} from "core/game_state/GameQueries";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {Expr, ExprBoolean} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import {EXPR} from "core/virtual_machine/expressions/EXPR";

export const evaluate_function_not = ({node, game_queries}: {
    node: AstNodeFunction
    game_queries: GameQueries
}): ExprBoolean => {
    assert_parameters_amount_equals(node, 1)

    const parameter = game_queries.evaluate(node.parameters[0])
    const value = !EXPR.as_boolean(parameter)

    return {
        type: "boolean",
        value,
        description: "not",
        params: [parameter]
    }
}
