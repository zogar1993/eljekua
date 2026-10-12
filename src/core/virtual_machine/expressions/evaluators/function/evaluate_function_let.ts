import type {Expr} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {evaluate_ast} from "core/virtual_machine/expressions/evaluators/evaluate_ast";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {get_iteration_variable_name} from "core/virtual_machine/expressions/evaluators/function/evaluate_function_map";

export const evaluate_function_let = ({node, game_state}: EvaluateFunctionProps): Expr => {
    assert_parameters_amount_equals(node, 3)

    const value = evaluate_ast({node: node.parameters[0], game_state})
    const variable_name = get_iteration_variable_name(node.parameters[1])
    const {vm_state} = game_state

    vm_state.set_variable(variable_name, value)
    return evaluate_ast({node: node.parameters[2], game_state})
}
