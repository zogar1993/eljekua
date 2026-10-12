import type {ExprBoolean} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {are_creatures_allied} from "core/battlegrid/creatures/are_creatures_allied";

export const evaluate_function_is_ally = ({node, game_state, game_queries}: EvaluateFunctionProps): ExprBoolean => {
    assert_parameters_amount_equals(node, 2)

    const parameters = node.parameters.map(parameter => game_queries.evaluate(parameter))

    const a = game_queries.evaluate_creature(parameters[0])
    const b = game_queries.evaluate_creature(parameters[1])

    return {
        type: "boolean",
        value: are_creatures_allied(a, b),
        description: "is ally",
        params: parameters
    }
}
