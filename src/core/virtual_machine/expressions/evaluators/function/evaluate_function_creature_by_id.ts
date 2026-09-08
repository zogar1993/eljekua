import type {ExprCreatures} from "core/virtual_machine/expressions/types";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {AST_NODE} from "core/virtual_machine/expressions/AST_NODE";
import type {GameState} from "core/game_state/GameState";

export const evaluate_function_creature_by_id = ({node, game_state}:
                                                 {
                                                     node: AstNodeFunction,
                                                     game_state: GameState,
                                                 }): ExprCreatures => {
    assert_parameters_amount_equals(node, 1)
    const {creatures} = game_state
    const creature_id = AST_NODE.as_number(node.parameters[0]).value

    const creature = creatures.get_by_id(creature_id)

    return {
        type: "creatures",
        value: [creature],
    }
}