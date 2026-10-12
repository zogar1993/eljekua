import {has_creature_equipped} from "core/battlegrid/creatures/Creature";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import {evaluate_ast} from "core/virtual_machine/expressions/evaluators/evaluate_ast";
import type {ExprBoolean} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {AST_NODE} from "core/virtual_machine/expressions/AST_NODE";

export const evaluate_function_equipped = ({node, game_state}: EvaluateFunctionProps): ExprBoolean => {
    assert_parameters_amount_equals(node, 2)
    const creature_expr = evaluate_ast({node: AST_NODE.as_keyword(node.parameters[0]), game_state})
    const creature = EXPR.as_creature(creature_expr)
    const text_expr = evaluate_ast({node: AST_NODE.as_string(node.parameters[1]), game_state})
    const text = EXPR.as_string(text_expr)

    return {
        type: "boolean",
        value: has_creature_equipped({creature, weapon_type: text}),
        description: "equipped",
        params: [creature_expr, text_expr]
    }
}
