import {has_creature_equipped} from "core/battlegrid/creatures/Creature";
import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import type {ExprBoolean} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {AST_NODE} from "core/virtual_machine/expressions/AST_NODE";

export const evaluate_function_equipped = ({node, game_state, game_queries}: EvaluateFunctionProps): ExprBoolean => {
    assert_parameters_amount_equals(node, 2)
    const creature_expr = game_queries.evaluate(AST_NODE.as_keyword(node.parameters[0]))
    const creature = game_queries.evaluate_creature(creature_expr)
    const text_expr = game_queries.evaluate(AST_NODE.as_string(node.parameters[1]))
    const text = game_queries.evaluate_string(text_expr)

    return {
        type: "boolean",
        value: has_creature_equipped({creature, weapon_type: text}),
        description: "equipped",
        params: [creature_expr, text_expr]
    }
}
