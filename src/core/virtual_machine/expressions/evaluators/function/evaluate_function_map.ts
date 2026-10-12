import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {evaluate_ast} from "core/virtual_machine/expressions/evaluators/evaluate_ast";
import type {ExprNumbers} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";

export const evaluate_function_map = ({node, game_state}: EvaluateFunctionProps): ExprNumbers => {
    assert_parameters_amount_equals(node, 3)

    const variable_name = get_iteration_variable_name(node.parameters[1])
    const expression = node.parameters[2]
    const {vm_state} = game_state
    const results = []

    for (const collection of EXPR.as_collection(evaluate_ast({node: node.parameters[0], game_state}))) {
        vm_state.set_variable(variable_name, collection)
        results.push(EXPR.as_number_resolved_expr(evaluate_ast({node: expression, game_state})))
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
