import type {AstNodeFunction} from "scripts/expressions/parser/nodes/AstNodeFunction";
import type {ExprBoolean} from "scripts/expressions/evaluator/types";
import {assert_parameters_amount_equals} from "scripts/expressions/evaluator/asserts";
import type {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import type {Expr} from "scripts/expressions/evaluator/types";
import {EXPR} from "scripts/expressions/evaluator/EXPR";

export const evaluate_function_is_greater_or_equal = ({node, evaluate_ast}:
                                                          {
                                                              node: AstNodeFunction
                                                              evaluate_ast: (node: AstNode) => Expr
                                                          }): ExprBoolean => {
    assert_parameters_amount_equals(node, 2)

    const parameters = node.parameters.map(evaluate_ast)

    const a = EXPR.as_number_resolved(parameters[0])
    const b = EXPR.as_number_resolved(parameters[1])
    return {
        type: "boolean",
        value: a.value >= b.value,
        description: ">=",
        params: parameters
    }
}