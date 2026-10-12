import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import type {ExprNumbers} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";

export const evaluate_function_map = ({node, game_state, game_queries}: EvaluateFunctionProps): ExprNumbers => {
    assert_parameters_amount_equals(node, 3)

    const variable_name = get_iteration_variable_name(node.parameters[1])
    const expression = node.parameters[2]
    const {vm_state} = game_state
    const results = []

    for (const collection of game_queries.evaluate_collection(game_queries.evaluate(node.parameters[0]))) {
        vm_state.set_variable(variable_name, collection)
        results.push(game_queries.evaluate_number_resolved_expr(game_queries.evaluate(expression)))
    }

    return {
        type: "numbers",
        value: results,
    }
}

export const get_iteration_variable_name = (node: AstNode): string => {
    if (node.type === "keyword")
        return node.value
    throw Error(`expected keyword for map variable name, got "${node.type}"`)
}
