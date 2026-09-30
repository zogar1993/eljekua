import type {GameQueries} from "core/game_state/GameQueries";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {ExprNumbers} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import type {GameState} from "core/game_state/GameState";

export const evaluate_function_map = ({node, game_queries, game_state}: {
    node: AstNodeFunction
    game_queries: GameQueries
    game_state: GameState
}): ExprNumbers => {
    assert_parameters_amount_equals(node, 3)

    const creatures = EXPR.as_creatures(game_queries.evaluate(node.parameters[0]))
    const variable_name = get_iteration_variable_name(node.parameters[1])
    const expression = node.parameters[2]
    const {vm_state} = game_state
    const results = []

    for (const creature of creatures) {
        vm_state.set_variable(variable_name, {type: "creatures", value: [creature]})
        results.push(EXPR.as_number_resolved_expr(game_queries.evaluate(expression)))
    }

    return {
        type: "numbers",
        value: results,
    }
}

const get_iteration_variable_name = (node: AstNode): string => {
    if (node.type === "keyword")
        return node.value
    throw Error(`expected keyword for map variable name, got "${node.type}"`)
}
