import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {evaluate_ast} from "core/virtual_machine/expressions/evaluators/evaluate_ast";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {distance_between_positions} from "core/battlegrid/Position";

export const evaluate_function_distance = ({node, game_state}: EvaluateFunctionProps): ExprNumberResolved => {
    assert_parameters_amount_equals(node, 2)

    const parameters = node.parameters.map(parameter => evaluate_ast({node: parameter, game_state}))

    const a = EXPR.as_position(parameters[0])
    const b = EXPR.as_position(parameters[1])

    return {
        type: "number_resolved",
        value: distance_between_positions(a, b),
        description: "distance",
        params: parameters
    }
}