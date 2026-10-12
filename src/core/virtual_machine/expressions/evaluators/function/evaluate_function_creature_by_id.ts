import type {ExprCreatures} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {AST_NODE} from "core/virtual_machine/expressions/AST_NODE";

export const evaluate_function_creature_by_id = ({node, game_state, game_queries}: EvaluateFunctionProps): ExprCreatures => {
    assert_parameters_amount_equals(node, 1)
    const {creatures} = game_state
    const creature_id = AST_NODE.as_number(node.parameters[0]).value

    const creature = creatures.get_by_id(creature_id)

    return {
        type: "creatures",
        value: [creature],
    }
}
