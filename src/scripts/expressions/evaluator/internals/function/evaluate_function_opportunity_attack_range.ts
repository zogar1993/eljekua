import type {AstNodeFunction} from "scripts/expressions/parser/nodes/AstNodeFunction";
import type {ExprBoolean, ExprNumberResolved} from "scripts/expressions/evaluator/types";
import {assert_parameters_amount_equals} from "scripts/expressions/evaluator/asserts";
import type {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import type {Expr} from "scripts/expressions/evaluator/types";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {distance_between_positions} from "scripts/battlegrid/Position";

export const evaluate_function_opportunity_attack_range = ({node, evaluate_ast}:
                                                               {
                                                                   node: AstNodeFunction
                                                                   evaluate_ast: (node: AstNode) => Expr
                                                               }): ExprNumberResolved => {
    assert_parameters_amount_equals(node, 1)

    const parameters = node.parameters.map(evaluate_ast)

    const creature = EXPR.as_creature(parameters[0])

    return {
        type: "number_resolved",
        value: 1,
        description: "opportunity attack range",
        params: parameters
    }
}