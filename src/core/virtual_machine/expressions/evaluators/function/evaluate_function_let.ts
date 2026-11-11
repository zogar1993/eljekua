import type {Expr} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {AST_NODE} from "core/virtual_machine/expressions/AST_NODE";

export const evaluate_function_let = ({node, game_state, game_queries}: EvaluateFunctionProps): Expr => {
    assert_parameters_amount_equals(node, 3)

    const value = game_queries.evaluate(node.parameters[0])
    const variable_name = AST_NODE.as_keyword(node.parameters[1]).value
    const {vm_state} = game_state

    vm_state.set_variable(variable_name, value)
    return game_queries.evaluate(node.parameters[2])
}
