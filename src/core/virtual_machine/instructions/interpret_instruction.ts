import {interpret_select_target} from "core/virtual_machine/instructions/interpreters/interpret_select_target";
import {
    interpret_define_attack_roll_result,
} from "core/virtual_machine/instructions/interpreters/interpret_define_attack_roll_result";
import {interpret_apply_damage} from "core/virtual_machine/instructions/interpreters/interpret_apply_damage";
import {interpret_move} from "core/virtual_machine/instructions/interpreters/interpret_move";
import {interpret_shift} from "core/virtual_machine/instructions/interpreters/interpret_shift";
import {interpret_force_movement} from "core/virtual_machine/instructions/interpreters/interpret_force_movement";
import {interpret_save_variable} from "core/virtual_machine/instructions/interpreters/interpret_save_variable";
import {interpret_options} from "core/virtual_machine/instructions/interpreters/interpret_options";
import {interpret_jump_if} from "core/virtual_machine/instructions/interpreters/interpret_jump_if";
import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {
    interpret_save_number_as_resolved
} from "core/virtual_machine/instructions/interpreters/interpret_save_number_as_resolved";
import {interpret_execute_power} from "core/virtual_machine/instructions/interpreters/interpret_execute_power";
import {
    interpret_add_powers_as_options
} from "core/virtual_machine/instructions/interpreters/interpret_add_powers_as_options";
import {interpret_apply_status} from "core/virtual_machine/instructions/interpreters/interpret_apply_status";
import {interpret_expend_action} from "core/virtual_machine/instructions/interpreters/interpret_expend_action";
import type {Instruction} from "core/virtual_machine/instructions/instructions";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";
import {interpret_end_turn} from "core/virtual_machine/instructions/interpreters/interpret_end_turn";
import {
    interpret_attack_roll_consequence
} from "core/virtual_machine/instructions/interpreters/interpret_attack_roll_consequence";
import {
    interpret_add_current_turn_base_options
} from "core/virtual_machine/instructions/interpreters/interpret_add_current_turn_base_options";
import {interpret_jump} from "core/virtual_machine/instructions/interpreters/interpret_jump";

export const interpret_instruction = (props: InterpretInstructionProps<Instruction>): void => {
    const {instruction} = props
    switch (instruction.type) {
        case INSTRUCTION_TYPE.SELECT_TARGET:
            return interpret_select_target({...props, instruction})
        case INSTRUCTION_TYPE.ATTACK_DICE_ROLL:
            return interpret_define_attack_roll_result({...props, instruction})
        case INSTRUCTION_TYPE.ATTACK_ROLL_CONSEQUENCE:
            return interpret_attack_roll_consequence({...props, instruction})
        case INSTRUCTION_TYPE.APPLY_DAMAGE:
            return interpret_apply_damage({...props, instruction})
        case INSTRUCTION_TYPE.MOVE:
            return interpret_move({...props, instruction})
        case INSTRUCTION_TYPE.SHIFT:
            return interpret_shift({...props, instruction})
        case INSTRUCTION_TYPE.FORCE_MOVEMENT:
            return interpret_force_movement({...props, instruction})
        case INSTRUCTION_TYPE.SAVE_VARIABLE:
            return interpret_save_variable({...props, instruction})
        case INSTRUCTION_TYPE.SAVE_NUMBER_AS_RESOLVED:
            return interpret_save_number_as_resolved({...props, instruction})
        case INSTRUCTION_TYPE.OPTIONS:
            return interpret_options({...props, instruction})
        case INSTRUCTION_TYPE.JUMP:
            return interpret_jump({...props, instruction})
        case INSTRUCTION_TYPE.JUMP_IF:
            return interpret_jump_if({...props, instruction})
        case INSTRUCTION_TYPE.ADD_POWERS_AS_OPTIONS:
            return interpret_add_powers_as_options({...props, instruction})
        case INSTRUCTION_TYPE.EXECUTE_POWER:
            return interpret_execute_power({...props, instruction})
        case INSTRUCTION_TYPE.APPLY_STATUS:
            return interpret_apply_status({...props, instruction})
        case INSTRUCTION_TYPE.EXPEND_ACTION:
            return interpret_expend_action({...props, instruction})
        case INSTRUCTION_TYPE.END_TURN:
            return interpret_end_turn({...props, instruction})
        case INSTRUCTION_TYPE.ADD_CURRENT_TURN_BASE_OPTIONS:
            return interpret_add_current_turn_base_options({...props, instruction})
        default:
            throw Error("instruction not implemented " + JSON.stringify(instruction))
    }
}