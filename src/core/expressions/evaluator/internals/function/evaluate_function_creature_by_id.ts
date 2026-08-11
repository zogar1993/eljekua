import type {ExprCreatures} from "core/expressions/evaluator/types";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import {assert_parameters_amount_equals} from "core/expressions/evaluator/asserts";
import {AST_NODE} from "core/expressions/parser/AST_NODE";
import {BattleGrid} from "core/battlegrid/BattleGrid";

export const evaluate_function_creature_by_id = ({node, battle_grid}:
                                                 {
                                                     node: AstNodeFunction,
                                                     battle_grid: BattleGrid,
                                                 }): ExprCreatures => {
    assert_parameters_amount_equals(node, 1)
    const creature_id = AST_NODE.as_number(node.parameters[0]).value

    const creature = battle_grid.creatures[creature_id]

    return {
        type: "creatures",
        value: [creature],
    }
}