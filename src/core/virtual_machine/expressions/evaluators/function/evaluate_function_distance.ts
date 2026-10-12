import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {distance_between_positions} from "core/battlegrid/Position";

export const evaluate_function_distance = ({node, game_state, game_queries}: EvaluateFunctionProps): ExprNumberResolved => {
    assert_parameters_amount_equals(node, 2)

    const parameters = node.parameters.map(parameter => game_queries.evaluate(parameter))

    const a = game_queries.evaluate_position(parameters[0])
    const b = game_queries.evaluate_position(parameters[1])

    return {
        type: "number_resolved",
        value: distance_between_positions(a, b),
        description: "distance",
        params: parameters
    }
}