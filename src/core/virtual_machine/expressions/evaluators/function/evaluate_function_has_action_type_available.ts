import type {GameQueries} from "core/game_state/GameQueries";
import {has_creature_action_available} from "core/battlegrid/creatures/Creature";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import type {ExprBoolean} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {assert_is_action_type} from "core/battlegrid/creatures/ActionType";

export const evaluate_function_has_action_type_available = ({node, game_queries}:
                                                                {
                                                                    node: AstNodeFunction
                                                                    game_queries: GameQueries
                                                                }): ExprBoolean => {
    assert_parameters_amount_equals(node, 2)

    const parameters = node.parameters.map(parameter => game_queries.evaluate(parameter))

    const creature = EXPR.as_creature(parameters[0])
    const action_type = EXPR.as_string(parameters[1])
    assert_is_action_type(action_type)

    return {
        type: "boolean",
        value: has_creature_action_available({creature, action: action_type}),
        description: "has action type available",
        params: parameters
    }
}