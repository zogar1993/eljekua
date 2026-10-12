import type {EvaluateFunctionProps} from "core/virtual_machine/expressions/evaluators/EvaluateAstProps";
import type {ExprBoolean} from "core/virtual_machine/expressions/types";
import {assert_parameters_amount_equals} from "core/virtual_machine/expressions/asserts";
import {AST_NODE} from "core/virtual_machine/expressions/AST_NODE";
import {get_valid_targets} from "core/battlegrid/position/get_valid_targets";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";

export const evaluate_function_has_valid_targeting = ({node, game_state, game_queries}: EvaluateFunctionProps): ExprBoolean => {
    assert_parameters_amount_equals(node, 1)
    const {vm_state, battle_grid} = game_state
    const power_name = AST_NODE.as_keyword(node.parameters[0]).value
    const power = game_queries.evaluate_power(vm_state.get_variable(power_name))

    const targeting_instruction = power.instructions.find(instruction => instruction.type === INSTRUCTION_TYPE.SELECT_TARGET)

    // If there is no select targeting instruction, then this check passes
    let is_targeting_valid = true

    if (targeting_instruction) {
        const valid_targets = get_valid_targets({
            instruction: targeting_instruction,
            battle_grid,
            game_queries,
            game_state,
        })
        is_targeting_valid = valid_targets.length > 0
    }

    return {
        type: "boolean",
        value: is_targeting_valid,
        description: "has valid targets"
    }
}
