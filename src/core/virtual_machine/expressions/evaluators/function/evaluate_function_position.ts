import type {ExprPositions} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {evaluate_ast} from "core/virtual_machine/expressions/evaluators/evaluate_ast";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";

export const evaluate_function_position = ({node, game_state}: EvaluateFunctionProps): ExprPositions => {
    assert_parameters_amount_equals(node, 1)

    const creature = EXPR.as_creature(evaluate_ast({node: node.parameters[0], game_state}))

    return {
        type: "positions",
        value: [creature.data.position],
    }
}
