import type {ExprBoolean} from "core/virtual_machine/expressions/types";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {AST_NODE} from "core/virtual_machine/expressions/AST_NODE";
import {GameState} from "core/game_state/GameState";

export const evaluate_function_exists = ({node, game_state}: {
    node: AstNodeFunction,
    game_state: GameState
}): ExprBoolean => {
    assert_parameters_amount_equals(node, 1)
    const parameter = AST_NODE.as_keyword(node.parameters[0])
    const {vm_state} = game_state

    return {
        type: "boolean",
        value: vm_state.has_variable(parameter.value),
        description: `exists ${parameter.value}`,
    }
}
