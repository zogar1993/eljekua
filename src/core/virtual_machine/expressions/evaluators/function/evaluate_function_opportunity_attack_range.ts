import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {Expr, ExprNumberResolved} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import {EXPR} from "core/virtual_machine/expressions/EXPR";

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