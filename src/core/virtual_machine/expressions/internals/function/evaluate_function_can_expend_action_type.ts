import type {Expr, ExprBoolean} from "core/virtual_machine/expressions/types";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {AstNode} from "core/expressions/parser/nodes/AstNode";
import {assert_is_action_type} from "core/battlegrid/creatures/ActionType";

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