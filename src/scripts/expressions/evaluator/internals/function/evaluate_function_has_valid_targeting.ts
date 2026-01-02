import type {Expr, ExprBoolean} from "scripts/expressions/evaluator/types";
import type {AstNodeFunction} from "scripts/expressions/parser/nodes/AstNodeFunction";
import {assert_parameters_amount_equals} from "scripts/expressions/evaluator/asserts";
import {AST_NODE} from "scripts/expressions/parser/AST_NODE";
import type {TurnState} from "scripts/battlegrid/player_turn_handler/TurnState";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import {BattleGrid} from "scripts/battlegrid/BattleGrid";
import {get_valid_targets} from "scripts/battlegrid/position/get_valid_targets";

export const evaluate_function_has_valid_targeting = ({node, turn_state, evaluate_ast, battle_grid}:
                                                          {
                                                              node: AstNodeFunction,
                                                              turn_state: TurnState,
                                                              battle_grid: BattleGrid,
                                                              evaluate_ast: (node: AstNode) => Expr
                                                          }): ExprBoolean => {
    assert_parameters_amount_equals(node, 1)

    const power_name = AST_NODE.as_keyword(node.parameters[0]).value
    const power = EXPR.as_power(turn_state.get_variable(power_name))

    const targeting_instruction = power.instructions.find(instruction => instruction.type === "select_target")

    // If there is no select targeting instruction then this check passes
    let is_targeting_valid = true

    if (targeting_instruction) {
        const valid_targets = get_valid_targets({instruction: targeting_instruction, battle_grid, evaluate_ast})
        is_targeting_valid = valid_targets.length > 0
    }

    return {
        type: "boolean",
        value: is_targeting_valid,
        description: "has valid targets"
    }
}