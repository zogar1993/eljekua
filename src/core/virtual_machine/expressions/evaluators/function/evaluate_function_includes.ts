import type {ExprBoolean} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";

export const evaluate_function_includes = ({node, game_queries}: EvaluateFunctionProps): ExprBoolean => {
    assert_parameters_amount_equals(node, 2)

    const creatures = game_queries.evaluate_creatures(game_queries.evaluate(node.parameters[0]))
    const creature = game_queries.evaluate_creature(game_queries.evaluate(node.parameters[1]))

    return {
        type: "boolean",
        value: creatures.includes(creature),
        description: "includes",
        params: [
            {type: "creatures", value: creatures},
            {type: "creatures", value: [creature]},
        ],
    }
}