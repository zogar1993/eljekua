import type {GameQueries} from "core/game_state/GameQueries";
import type {ExprNumber} from "core/virtual_machine/expressions/types";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import {
    add_numbers,
    add_numbers_resolved,
    is_number,
    is_number_resolved
} from "core/virtual_machine/expressions/number_utils";

export const evaluate_function_add = ({node, game_queries}:
                                          {
                                              node: AstNodeFunction,
                                              game_queries: GameQueries,
                                          }): ExprNumber => {
    const params = node.parameters.map(parameter => game_queries.evaluate(parameter))

    if (params.every(is_number_resolved))
        return add_numbers_resolved(params)

    if (params.every(is_number))
        return add_numbers(params)

    throw Error(`not all params evaluate to numbers on add function`)
}