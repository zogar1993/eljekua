import type {ExprBoolean} from "core/virtual_machine/expressions/types";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {AST_NODE} from "core/virtual_machine/expressions/AST_NODE";
import type {TurnState} from "core/battlegrid/player_turn_handler/TurnState";

export const evaluate_function_exists = ({node, turn_state}:
                                             {
                                                 node: AstNodeFunction,
                                                 turn_state: TurnState
                                             }): ExprBoolean => {
    assert_parameters_amount_equals(node, 1)
    const parameter = AST_NODE.as_keyword(node.parameters[0])

    return {
        type: "boolean",
        value: turn_state.has_variable(parameter.value),
        description: `exists ${parameter.value}`,
    }
}
