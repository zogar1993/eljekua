import type {ExprBoolean} from "scripts/expressions/evaluator/types";
import type {AstNodeFunction} from "scripts/expressions/parser/nodes/AstNodeFunction";
import {assert_parameters_amount_equals} from "scripts/expressions/evaluator/asserts";
import {AST_NODE} from "scripts/expressions/parser/AST_NODE";
import type {TurnContext} from "scripts/battlegrid/player_turn_handler/TurnContext";

export const evaluate_function_exists = ({node, turn_context}:
                                             {
                                                 node: AstNodeFunction,
                                                 turn_context: TurnContext
                                             }): ExprBoolean => {
    assert_parameters_amount_equals(node, 1)
    const parameter = AST_NODE.as_keyword(node.parameters[0])

    return {
        type: "boolean",
        value: turn_context.get_current_context().has_variable(parameter.value),
        description: `exists ${parameter.value}`,
    }
}
