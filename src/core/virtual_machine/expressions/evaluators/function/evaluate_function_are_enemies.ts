import type {GameQueries} from "core/game_state/GameQueries";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {ExprBoolean} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {are_creatures_allied} from "core/battlegrid/creatures/are_creatures_allied";

export const evaluate_function_are_enemies = ({node, game_queries}:
                                                               {
                                                                   node: AstNodeFunction
                                                                   game_queries: GameQueries
                                                               }): ExprBoolean => {
    assert_parameters_amount_equals(node, 2)

    const parameters = node.parameters.map(parameter => game_queries.evaluate(parameter))

    const a = EXPR.as_creature(parameters[0])
    const b = EXPR.as_creature(parameters[1])

    return {
        type: "boolean",
        value: !are_creatures_allied(a, b),
        description: "are enemies",
        params: parameters
    }
}
