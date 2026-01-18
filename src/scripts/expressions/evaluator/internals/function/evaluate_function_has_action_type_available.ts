import type {AstNodeFunction} from "scripts/expressions/parser/nodes/AstNodeFunction";
import type {ExprBoolean} from "scripts/expressions/evaluator/types";
import {assert_parameters_amount_equals} from "scripts/expressions/evaluator/asserts";
import type {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import type {Expr} from "scripts/expressions/evaluator/types";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {assert_is_action_type} from "scripts/battlegrid/creatures/ActionType";

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