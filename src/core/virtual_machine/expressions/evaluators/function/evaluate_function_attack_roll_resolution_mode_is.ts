import type {GameQueries} from "core/game_state/GameQueries";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {ExprBoolean} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import type {GameState} from "core/game_state/GameState";
import {EXPR} from "core/virtual_machine/expressions/EXPR";

export const evaluate_function_attack_roll_resolution_mode_is = ({
                                                                     node,
                                                                     game_state,
                                                                     game_queries,
                                                                 }: {
    node: AstNodeFunction
    game_state: GameState
    game_queries: GameQueries
}): ExprBoolean => {
    assert_parameters_amount_equals(node, 1)

    const resolution = EXPR.as_string(game_queries.evaluate(node.parameters[0]))

    return {
        type: "boolean",
        value: game_state.settings.attack_roll_resolution === resolution,
        description: "attack_roll_resolution_is",
    }
}
