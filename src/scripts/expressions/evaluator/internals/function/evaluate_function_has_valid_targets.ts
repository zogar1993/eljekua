import type {Expr, ExprBoolean} from "scripts/expressions/evaluator/types";
import type {AstNodeFunction} from "scripts/expressions/parser/nodes/AstNodeFunction";
import {assert_parameters_amount_equals} from "scripts/expressions/evaluator/asserts";
import {AST_NODE} from "scripts/expressions/parser/AST_NODE";
import type {TurnState} from "scripts/battlegrid/player_turn_handler/TurnState";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import {BattleGrid} from "scripts/battlegrid/BattleGrid";
import {get_valid_targets} from "scripts/battlegrid/position/get_valid_targets";

export const evaluate_function_has_valid_targets = ({node, turn_state, evaluate_ast, battle_grid}:
                                                        {
                                                            node: AstNodeFunction,
                                                            turn_state: TurnState,
                                                            battle_grid: BattleGrid,
                                                            evaluate_ast: (node: AstNode) => Expr
                                                        }): ExprBoolean => {
    assert_parameters_amount_equals(node, 1)

    const power_name = AST_NODE.as_keyword(node.parameters[0]).value
    const context = turn_state.get_current_context()
    const power = EXPR.as_power(context.get_variable(power_name))

    const first_instruction = power.instructions[0]

    // If it does not need targets because it does not start with "select_target" we take as it's ok
    let has_valid_targets = true
    if (first_instruction.type === "select_target") {
        const valid_targets = get_valid_targets({instruction: first_instruction, context, battle_grid, evaluate_ast})
        has_valid_targets = valid_targets.length > 0
    }

    return {
        type: "boolean",
        value: has_valid_targets,
        description: "has valid targets"
    }
}