import type {GameQueries} from "core/game_state/GameQueries";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {ExprPositions} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";

export const evaluate_function_position = ({node, game_queries}: {
    node: AstNodeFunction
    game_queries: GameQueries
}): ExprPositions => {
    assert_parameters_amount_equals(node, 1)

    const creature = EXPR.as_creature(game_queries.evaluate(node.parameters[0]))

    return {
        type: "positions",
        value: [creature.data.position],
    }
}
