import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {evaluate_ast} from "core/virtual_machine/expressions/evaluators/evaluate_ast";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";

export const evaluate_function_opportunity_attack_range = ({node, game_state}: EvaluateFunctionProps): ExprNumberResolved => {
    assert_parameters_amount_equals(node, 1)

    const parameters = node.parameters.map(parameter => evaluate_ast({node: parameter, game_state}))

    const creature = EXPR.as_creature(parameters[0])

    return {
        type: "number_resolved",
        value: 1,
        description: "opportunity attack range",
        params: parameters
    }
}