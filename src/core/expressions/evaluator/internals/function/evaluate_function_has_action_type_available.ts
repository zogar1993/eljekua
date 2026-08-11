import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {Expr, ExprBoolean} from "core/expressions/evaluator/types";
import {assert_parameters_amount_equals} from "core/expressions/evaluator/asserts";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import {EXPR} from "core/expressions/evaluator/EXPR";
import {assert_is_action_type} from "core/battlegrid/creatures/ActionType";

export const evaluate_function_has_action_type_available = ({node, evaluate_ast}:
                                                                {
                                                                    node: AstNodeFunction
                                                                    evaluate_ast: (node: AstNode) => Expr
                                                                }): ExprBoolean => {
    assert_parameters_amount_equals(node, 2)

    const parameters = node.parameters.map(evaluate_ast)

    const creature = EXPR.as_creature(parameters[0])
    const action_type = EXPR.as_string(parameters[1])
    assert_is_action_type(action_type)

    return {
        type: "boolean",
        value: creature.has_action_available(action_type),
        description: "has action type available",
        params: parameters
    }
}