import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";

export const evaluate_function_opportunity_attack_range = ({node, game_state, game_queries}: EvaluateFunctionProps): ExprNumberResolved => {
    assert_parameters_amount_equals(node, 1)

    const parameters = node.parameters.map(parameter => game_queries.evaluate(parameter))

    const creature = game_queries.evaluate_creature(parameters[0])

    return {
        type: "number_resolved",
        value: 1,
        description: "opportunity attack range",
        params: parameters
    }
}