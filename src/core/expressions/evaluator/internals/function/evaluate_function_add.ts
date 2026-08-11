import type {Expr, ExprNumber} from "core/expressions/evaluator/types";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import {
    add_numbers,
    add_numbers_resolved,
    is_number,
    is_number_resolved
} from "core/expressions/evaluator/number_utils";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";

export const evaluate_function_add = ({node, evaluate_ast}:
                                          {
                                              node: AstNodeFunction,
                                              evaluate_ast: (node: AstNode) => Expr,
                                          }): ExprNumber => {
    const params = node.parameters.map(evaluate_ast)

    if (params.every(is_number_resolved))
        return add_numbers_resolved(params)

    if (params.every(is_number))
        return add_numbers(params)

    throw Error(`not all params evaluate to numbers on add function`)
}