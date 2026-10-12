import type {ExprPositions} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";

export const evaluate_function_position = ({node, game_state, game_queries}: EvaluateFunctionProps): ExprPositions => {
    assert_parameters_amount_equals(node, 1)

    const creature = game_queries.evaluate_creature(game_queries.evaluate(node.parameters[0]))

    return {
        type: "positions",
        value: [creature.data.position],
    }
}
