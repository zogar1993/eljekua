import type {Expr, ExprBoolean} from "core/virtual_machine/expressions/types";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {AST_NODE} from "core/virtual_machine/expressions/AST_NODE";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";

export const evaluate_function_equipped = ({node, evaluate_ast}:
                                               {
                                                   node: AstNodeFunction,
                                                   evaluate_ast: (node: AstNode) => Expr,
                                               }): ExprBoolean => {
    assert_parameters_amount_equals(node, 2)
    const creature_expr = evaluate_ast(AST_NODE.as_keyword(node.parameters[0]))
    const creature = EXPR.as_creature(creature_expr)
    const text_expr = evaluate_ast(AST_NODE.as_string(node.parameters[1]))
    const text = EXPR.as_string(text_expr)

    return {
        type: "boolean",
        value: creature.has_equipped(text),
        description: "equipped",
        params: [creature_expr, text_expr]
    }
}