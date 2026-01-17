import type {AstNodeFunction} from "scripts/expressions/parser/nodes/AstNodeFunction";
import type {ExprBoolean, ExprNumberResolved} from "scripts/expressions/evaluator/types";
import {assert_parameters_amount_equals} from "scripts/expressions/evaluator/asserts";
import type {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import type {Expr} from "scripts/expressions/evaluator/types";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {distance_between_positions} from "scripts/battlegrid/Position";

export const evaluate_function_are_enemies = ({node, evaluate_ast}:
                                                               {
                                                                   node: AstNodeFunction
                                                                   evaluate_ast: (node: AstNode) => Expr
                                                               }): ExprBoolean => {
    assert_parameters_amount_equals(node, 2)

    const parameters = node.parameters.map(evaluate_ast)

    const a = EXPR.as_creature(parameters[0])
    const b = EXPR.as_creature(parameters[1])

    return {
        type: "boolean",
        value: a.data.team === null || b.data.team === null || a.data.team !== b.data.team,
        description: "are enemies",
        params: parameters
    }
}