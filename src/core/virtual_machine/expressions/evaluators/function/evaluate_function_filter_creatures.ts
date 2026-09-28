import type {GameQueries} from "core/game_state/GameQueries";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {ExprCreatures} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import type {GameState} from "core/game_state/GameState";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import type {Creature} from "core/battlegrid/creatures/Creature";

export const evaluate_function_filter_creatures = ({node, game_queries, game_state}: {
    node: AstNodeFunction
    game_queries: GameQueries
    game_state: GameState
}): ExprCreatures => {
    assert_parameters_amount_equals(node, 2)

    const creatures = EXPR.as_creatures(game_queries.evaluate(node.parameters[0]))
    const condition = node.parameters[1]
    const {vm_state} = game_state
    const filtered: Array<Creature> = []

    for (const creature of creatures) {
        vm_state.set_variable(SYSTEM_KEYWORD.FILTER_CREATURE, {type: "creatures", value: [creature]})
        if (EXPR.as_boolean(game_queries.evaluate(condition)))
            filtered.push(creature)
    }

    return {
        type: "creatures",
        value: filtered,
    }
}
