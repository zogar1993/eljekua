import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {Expr, ExprBoolean} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import {EXPR} from "core/virtual_machine/expressions/EXPR";

export const evaluate_function_not = ({node, evaluate_ast}: {
    node: AstNodeFunction
    evaluate_ast: (node: AstNode) => Expr
}): ExprBoolean => {
    assert_parameters_amount_equals(node, 1)

    const parameter = evaluate_ast(node.parameters[0])
    const value = !EXPR.as_boolean(parameter)

    return {
        type: "boolean",
        value,
        description: "not",
        params: [parameter]
    }
}
