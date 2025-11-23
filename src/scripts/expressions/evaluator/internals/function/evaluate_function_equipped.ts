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
    const creature = EXPR.as_creatures_expr(evaluate_ast(AST_NODE.as_keyword(node.parameters[0])))
    const text = EXPR.as_string(evaluate_ast(AST_NODE.as_string(node.parameters[1])))

    return {
        type: "boolean",
        //TODO P3 this is a bit ugly
        value: creature.value[0].has_equipped(text.value),
        description: "equipped",
        params: [creature, text]
    }
}
