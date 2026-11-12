import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {get_creature_speed} from "core/battlegrid/creatures/get_creature_speed";

export const evaluate_function_speed = ({node, game_state, game_queries}: EvaluateFunctionProps): ExprNumberResolved => {
    assert_parameters_amount_equals(node, 1)

    const creature = game_queries.evaluate_creature(game_queries.evaluate(node.parameters[0]))

    return {
        type: "number_resolved",
        value: get_creature_speed({creature}),
        description: "speed",
    }
}