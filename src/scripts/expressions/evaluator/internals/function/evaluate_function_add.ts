import type {ExprNumber} from "scripts/expressions/evaluator/types";
import type {AstNodeFunction} from "scripts/expressions/parser/nodes/AstNodeFunction";
import {
    number_utils,
    add_numbers_resolved,
    is_number,
    is_number_resolved
} from "scripts/expressions/evaluator/number_utils";
import type {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import type {Expr} from "scripts/expressions/evaluator/types";

export const evaluate_function_add = ({node, evaluate_ast}:
                                          {
                                              node: AstNodeFunction,
                                              evaluate_ast: (node: AstNode) => Expr,
                                          }): ExprNumber => {
    const params = node.parameters.map(evaluate_ast)

    if (params.every(is_number_resolved))
        return add_numbers_resolved(params)

    if (params.every(is_number))
        return number_utils(params)

    throw Error(`not all params evaluate to numbers on add function`)
}