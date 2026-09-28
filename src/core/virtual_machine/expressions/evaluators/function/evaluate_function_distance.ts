import type {GameQueries} from "core/game_state/GameQueries";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {distance_between_positions} from "core/battlegrid/Position";

export const evaluate_function_distance = ({node, game_queries}:
                                                     {
                                                         node: AstNodeFunction
                                                         game_queries: GameQueries
                                                     }): ExprNumberResolved => {
    assert_parameters_amount_equals(node, 2)

    const parameters = node.parameters.map(parameter => game_queries.evaluate(parameter))

    const a = EXPR.as_position(parameters[0])
    const b = EXPR.as_position(parameters[1])

    return {
        type: "number_resolved",
        value: distance_between_positions(a, b),
        description: "distance",
        params: parameters
    }
}