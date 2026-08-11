import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {Expr, ExprNumberResolved} from "core/expressions/evaluator/types";
import {assert_parameters_amount_equals} from "core/expressions/evaluator/asserts";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import {EXPR} from "core/expressions/evaluator/EXPR";
import {distance_between_positions} from "core/battlegrid/Position";

export const evaluate_function_distance = ({node, evaluate_ast}:
                                                     {
                                                         node: AstNodeFunction
                                                         evaluate_ast: (node: AstNode) => Expr
                                                     }): ExprNumberResolved => {
    assert_parameters_amount_equals(node, 2)

    const parameters = node.parameters.map(evaluate_ast)

    const a = EXPR.as_position(parameters[0])
    const b = EXPR.as_position(parameters[1])

    return {
        type: "number_resolved",
        value: distance_between_positions(a, b),
        description: "distance",
        params: parameters
    }
}