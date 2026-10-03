import type {GameQueries} from "core/game_state/GameQueries";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {ExprBoolean} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import type {GameState} from "core/game_state/GameState";
import {has_combat_advantage} from "core/battlegrid/queries/has_combat_advantage";

export const evaluate_function_has_combat_advantage = ({node, game_queries, game_state}: {
    node: AstNodeFunction
    game_queries: GameQueries
    game_state: GameState
}): ExprBoolean => {
    assert_parameters_amount_equals(node, 2)

    const parameters = node.parameters.map(parameter => game_queries.evaluate(parameter))

    const attacker = EXPR.as_creature(parameters[0])
    const defender = EXPR.as_creature(parameters[1])

    return {
        type: "boolean",
        value: has_combat_advantage({attacker, defender, battle_grid: game_state.battle_grid}),
        description: "has combat advantage",
        params: parameters,
    }
}
