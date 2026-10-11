import type {GameQueries} from "core/game_state/GameQueries";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {Expr} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import type {GameState} from "core/game_state/GameState";
import {get_iteration_variable_name} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_map";

export const evaluate_function_let = ({node, game_queries, game_state}: {
    node: AstNodeFunction
    game_queries: GameQueries
    game_state: GameState
}): Expr => {
    assert_parameters_amount_equals(node, 3)

    const value = game_queries.evaluate(node.parameters[0])
    const variable_name = get_iteration_variable_name(node.parameters[1])
    const {vm_state} = game_state

    vm_state.set_variable(variable_name, value)
    return game_queries.evaluate(node.parameters[2])
}
