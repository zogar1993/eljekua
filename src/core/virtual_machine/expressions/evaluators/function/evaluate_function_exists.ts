import type {ExprBoolean} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {AST_NODE} from "core/virtual_machine/expressions/AST_NODE";

export const evaluate_function_exists = ({node, game_state, game_queries}: EvaluateFunctionProps): ExprBoolean => {
    assert_parameters_amount_equals(node, 1)
    const parameter = AST_NODE.as_keyword(node.parameters[0])
    const {vm_state} = game_state

    return {
        type: "boolean",
        value: vm_state.has_variable(parameter.value),
        description: `exists ${parameter.value}`,
    }
}
