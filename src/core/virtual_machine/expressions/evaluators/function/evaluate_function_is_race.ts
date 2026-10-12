import type {ExprBoolean} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {evaluate_ast} from "core/virtual_machine/expressions/evaluators/evaluate_ast";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR"

export const evaluate_function_is_race = ({node, game_state}: EvaluateFunctionProps): ExprBoolean => {
    assert_parameters_amount_equals(node, 2)

    const parameters = node.parameters.map(parameter => evaluate_ast({node: parameter, game_state}))
    const creature = EXPR.as_creature(parameters[0])
    const race = EXPR.as_string(parameters[1])

    return {
        type: "boolean",
        value: creature.data.race === race,
        description: "is race",
        params: parameters,
    }
}