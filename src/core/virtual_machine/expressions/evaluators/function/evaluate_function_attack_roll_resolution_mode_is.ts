import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {Expr, ExprBoolean} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import type {GameState} from "core/game_state/GameState";
import {EXPR} from "core/virtual_machine/expressions/EXPR";

export const evaluate_function_attack_roll_resolution_mode_is = ({
                                                                     node,
                                                                     game_state,
                                                                     evaluate_ast,
                                                                 }: {
    node: AstNodeFunction
    game_state: GameState
    evaluate_ast: (node: AstNode) => Expr
}): ExprBoolean => {
    assert_parameters_amount_equals(node, 1)

    const resolution = EXPR.as_string(evaluate_ast(node.parameters[0]))

    return {
        type: "boolean",
        value: game_state.settings.attack_roll_resolution === resolution,
        description: "attack_roll_resolution_is",
    }
}
