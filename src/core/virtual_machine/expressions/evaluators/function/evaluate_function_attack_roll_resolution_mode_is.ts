import type {ExprBoolean} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {evaluate_ast} from "core/virtual_machine/expressions/evaluators/evaluate_ast";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";

export const evaluate_function_attack_roll_resolution_mode_is = ({node, game_state}: EvaluateFunctionProps): ExprBoolean => {
    assert_parameters_amount_equals(node, 1)

    const resolution = EXPR.as_string(evaluate_ast({node: node.parameters[0], game_state}))

    return {
        type: "boolean",
        value: game_state.settings.attack_roll_resolution === resolution,
        description: "attack_roll_resolution_is",
    }
}
