import type {GameQueries} from "core/game_state/GameQueries";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {ExprPositions} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import type {GameState} from "core/game_state/GameState";
import type {Position} from "core/battlegrid/Position";
import {get_iteration_variable_name} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_map";

export const evaluate_function_filter = ({node, game_queries, game_state}: {
    node: AstNodeFunction
    game_queries: GameQueries
    game_state: GameState
}): ExprPositions => {
    assert_parameters_amount_equals(node, 3)

    const positions = EXPR.as_positions(game_queries.evaluate(node.parameters[0]))
    const variable_name = get_iteration_variable_name(node.parameters[1])
    const condition = node.parameters[2]
    const {vm_state} = game_state
    const filtered: Array<Position> = []

    for (const position of positions) {
        vm_state.set_variable(variable_name, {type: "positions", value: [position]})
        if (EXPR.as_boolean(game_queries.evaluate(condition)))
            filtered.push(position)
    }

    return {
        type: "positions",
        value: filtered,
    }
}
