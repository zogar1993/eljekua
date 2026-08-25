import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {Expr, ExprBoolean} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import {EXPR} from "core/virtual_machine/expressions/EXPR";

export const evaluate_function_is_greater_or_equal = ({node, evaluate_ast}:
                                                          {
                                                              node: AstNodeFunction
                                                              evaluate_ast: (node: AstNode) => Expr
                                                          }): ExprBoolean => {
    assert_parameters_amount_equals(node, 2)

    const parameters = node.parameters.map(evaluate_ast)

    const a = EXPR.as_number(parameters[0])
    const b = EXPR.as_number(parameters[1])
    return {
        type: "boolean",
        value: a >= b,
        description: ">=",
        params: parameters
    }
}