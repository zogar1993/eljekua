import type {GameQueries} from "core/game_state/GameQueries";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {ExprBoolean} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_is_at_least} from "core/virtual_machine/expressions/asserts";

export const evaluate_function_and = ({node, game_queries}:
                                         {
                                             node: AstNodeFunction
                                             game_queries: GameQueries
                                         }): ExprBoolean => {
    assert_parameters_amount_is_at_least(node, 2)

    const parameters = node.parameters.map(parameter => game_queries.evaluate(parameter))

    if (!parameters.every(parameter => parameter.type === "boolean"))
        throw Error(`Expected all '$and()' parameters to evaluate to booleans, but found '${JSON.stringify(parameters)}'`)

    const result = parameters.every(parameter => parameter.value)

    return {
        type: "boolean",
        value: result,
        description: "not_equals",
        params: parameters
    }
}