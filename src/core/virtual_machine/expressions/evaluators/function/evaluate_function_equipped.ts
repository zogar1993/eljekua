import type {GameQueries} from "core/game_state/GameQueries";
import {has_creature_equipped} from "core/battlegrid/creatures/Creature";
import type {Expr, ExprBoolean} from "core/virtual_machine/expressions/types";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {AST_NODE} from "core/virtual_machine/expressions/AST_NODE";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";

export const evaluate_function_equipped = ({node, game_queries}:
                                               {
                                                   node: AstNodeFunction,
                                                   game_queries: GameQueries,
                                               }): ExprBoolean => {
    assert_parameters_amount_equals(node, 2)
    const creature_expr = game_queries.evaluate(AST_NODE.as_keyword(node.parameters[0]))
    const creature = EXPR.as_creature(creature_expr)
    const text_expr = game_queries.evaluate(AST_NODE.as_string(node.parameters[1]))
    const text = EXPR.as_string(text_expr)

    return {
        type: "boolean",
        value: has_creature_equipped({creature, weapon_type: text}),
        description: "equipped",
        params: [creature_expr, text_expr]
    }
}