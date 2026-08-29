import type {Expr, ExprBoolean} from "core/virtual_machine/expressions/types";
import type {AstNodeFunction} from "core/expressions/parser/nodes/AstNodeFunction";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {AST_NODE} from "core/virtual_machine/expressions/AST_NODE";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import {get_valid_targets} from "core/battlegrid/position/get_valid_targets";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";
import {GameState} from "core/game_state/GameState";

export const evaluate_function_has_valid_targeting = ({node, evaluate_ast, game_state}:
                                                          {
                                                              node: AstNodeFunction,
                                                              game_state: GameState,
                                                              evaluate_ast: (node: AstNode) => Expr
                                                          }): ExprBoolean => {
    assert_parameters_amount_equals(node, 1)
    const {vm_state, battle_grid} = game_state
    const power_name = AST_NODE.as_keyword(node.parameters[0]).value
    const power = EXPR.as_power(vm_state.get_variable(power_name))

    const targeting_instruction = power.instructions.find(instruction => instruction.type === INSTRUCTION_TYPE.SELECT_TARGET)

    // If there is no select targeting instruction, then this check passes
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