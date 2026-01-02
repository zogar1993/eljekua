import type {Expr, ExprBoolean} from "scripts/expressions/evaluator/types";
import type {AstNodeFunction} from "scripts/expressions/parser/nodes/AstNodeFunction";
import {assert_parameters_amount_equals} from "scripts/expressions/evaluator/asserts";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import {assert_is_action_type} from "scripts/battlegrid/creatures/ActionType";

export const evaluate_function_can_expend_action_type = ({node, evaluate_ast}:
                                                             {
                                                                 node: AstNodeFunction,
                                                                 evaluate_ast: (node: AstNode) => Expr
                                                             }): ExprBoolean => {
    assert_parameters_amount_equals(node, 2)

    const creature = EXPR.as_creature(evaluate_ast(node.parameters[0]))
    const action_type = EXPR.as_string(evaluate_ast(node.parameters[1]))
    assert_is_action_type(action_type)

    return {
        type: "boolean",
        value: creature.has_action_available(action_type),
        description: "has action available"
    }
}