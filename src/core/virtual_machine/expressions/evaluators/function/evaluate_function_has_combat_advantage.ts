import type {ExprBoolean} from "core/virtual_machine/expressions/types";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {evaluate_ast} from "core/virtual_machine/expressions/evaluators/evaluate_ast";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {has_combat_advantage} from "core/battlegrid/queries/has_combat_advantage";

export const evaluate_function_has_combat_advantage = ({node, game_state}: EvaluateFunctionProps): ExprBoolean => {
    assert_parameters_amount_equals(node, 2)

    const parameters = node.parameters.map(parameter => evaluate_ast({node: parameter, game_state}))

    const attacker = EXPR.as_creature(parameters[0])
    const defender = EXPR.as_creature(parameters[1])

    return {
        type: "boolean",
        value: has_combat_advantage({attacker, defender, battle_grid: game_state.battle_grid}),
        description: "has combat advantage",
        params: parameters,
    }
}
