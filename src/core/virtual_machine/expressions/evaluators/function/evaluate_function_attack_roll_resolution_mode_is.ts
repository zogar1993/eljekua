import type {ExprBoolean} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";

export const evaluate_function_attack_roll_resolution_mode_is = ({node, game_state, game_queries}: EvaluateFunctionProps): ExprBoolean => {
    assert_parameters_amount_equals(node, 1)

    const resolution = game_queries.evaluate_string(game_queries.evaluate(node.parameters[0]))

    return {
        type: "boolean",
        value: game_state.settings.attack_roll_resolution === resolution,
        description: "attack_roll_resolution_is",
    }
}
