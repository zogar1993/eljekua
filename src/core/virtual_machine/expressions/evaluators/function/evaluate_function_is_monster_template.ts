import type {ExprBoolean} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";

export const evaluate_function_is_monster_template = ({node, game_state, game_queries}: EvaluateFunctionProps): ExprBoolean => {
    assert_parameters_amount_equals(node, 2)

    const parameters = node.parameters.map(parameter => game_queries.evaluate(parameter))

    const creature = game_queries.evaluate_creature(parameters[0])
    const template = game_queries.evaluate_string(parameters[1])

    return {
        type: "boolean",
        value: creature.data.template === template,
        description: "is monster template",
        params: parameters
    }
}
