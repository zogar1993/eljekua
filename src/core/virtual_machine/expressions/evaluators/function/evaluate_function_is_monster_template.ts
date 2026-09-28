import type {GameQueries} from "core/game_state/GameQueries";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {Expr, ExprBoolean} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import {EXPR} from "core/virtual_machine/expressions/EXPR";

export const evaluate_function_is_monster_template = ({node, game_queries}:
                                                          {
                                                              node: AstNodeFunction
                                                              game_queries: GameQueries
                                                          }): ExprBoolean => {
    assert_parameters_amount_equals(node, 2)

    const parameters = node.parameters.map(parameter => game_queries.evaluate(parameter))

    const creature = EXPR.as_creature(parameters[0])
    const template = EXPR.as_string(parameters[1])

    return {
        type: "boolean",
        value: creature.data.template === template,
        description: "is monster template",
        params: parameters
    }
}
