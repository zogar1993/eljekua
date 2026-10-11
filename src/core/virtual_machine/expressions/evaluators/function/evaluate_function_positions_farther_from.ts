import type {GameQueries} from "core/game_state/GameQueries";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {ExprPositions} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import type {GameState} from "core/game_state/GameState";
import {distance_between_positions, positions_of_same_footprint_equal} from "core/battlegrid/Position";
import {AST} from "core/virtual_machine/expressions/AST_NODE";

export const evaluate_function_positions_farther_from = ({node, game_queries, game_state}: {
    node: AstNodeFunction
    game_queries: GameQueries
    game_state: GameState
}): ExprPositions => {
//TODO this function is redundant with more granular functions, and needs to be removed
    assert_parameters_amount_equals(node, 1)

    const anchor = EXPR.as_position(game_queries.evaluate(node.parameters[0]))
    const owner = EXPR.as_creature(game_queries.evaluate(AST.OWNER))
    const origin = owner.data.position
    const min_distance = distance_between_positions(anchor, origin)
    const {battle_grid} = game_state
    const result: Array<typeof origin> = []

    for (let y = 0; y < battle_grid.size.y; y++)
        for (let x = 0; x < battle_grid.size.x; x++) {
            const position = {x, y, footprint: 1 as const}
            if (distance_between_positions(anchor, position) > min_distance)
                result.push(position)
        }

    return {
        type: "positions",
        value: result.filter((position, index) =>
            result.findIndex(other => positions_of_same_footprint_equal(other, position)) === index
        ),
    }
}
