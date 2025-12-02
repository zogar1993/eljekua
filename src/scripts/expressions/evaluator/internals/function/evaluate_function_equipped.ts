import type {ExprBoolean} from "scripts/expressions/evaluator/types";
import type {AstNodeFunction} from "scripts/expressions/parser/nodes/AstNodeFunction";
import {assert_parameters_amount_equals} from "scripts/expressions/evaluator/asserts";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {AST_NODE} from "scripts/expressions/parser/AST_NODE";
import type {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import type {Expr} from "scripts/expressions/evaluator/types";

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