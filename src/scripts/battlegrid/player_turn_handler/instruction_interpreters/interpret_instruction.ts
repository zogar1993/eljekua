import {
    interpret_select_target
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_select_target";
import {
    interpret_attack_roll
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_attack_roll";
import {
    interpret_apply_damage
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_apply_damage";
import {interpret_move} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_move";
import {interpret_shift} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_shift";
import {
    interpret_force_movement
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_force_movement";
import {
    interpret_save_variable
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_save_variable";
import {interpret_options} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_options";
import {interpret_condition} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_condition";
import type {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {
    interpret_save_number_as_resolved
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_save_number_as_resolved";
import {
    interpret_execute_power
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_execute_power";
import {
    interpret_add_powers_as_options
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_add_powers_as_options";
import {
    interpret_apply_status
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_apply_status";
import {
    interpret_expend_action
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_expend_action";
import {Instruction} from "scripts/expressions/parser/instructions";
import {interpret_end_turn} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_end_turn";

export const interpret_instruction = (props: InterpretInstructionProps<Instruction>): void => {
    const {instruction} = props
    switch (instruction.type) {
        case "select_target":
            return interpret_select_target({...props, instruction})
        case "attack_roll":
            return interpret_attack_roll({...props, instruction})
        case "apply_damage":
            return interpret_apply_damage({...props, instruction})
        case "move":
            return interpret_move({...props, instruction})
        case "shift":
            return interpret_shift({...props, instruction})
        case "force_movement":
            return interpret_force_movement({...props, instruction})
        case "save_variable":
            return interpret_save_variable({...props, instruction})
        case "save_number_as_resolved":
            return interpret_save_number_as_resolved({...props, instruction})
        case "options":
            return interpret_options({...props, instruction})
        case "condition":
            return interpret_condition({...props, instruction})
        case "add_powers_as_options":
            return interpret_add_powers_as_options({...props, instruction})
        case "execute_power":
            return interpret_execute_power({...props, instruction})
        case "apply_status":
            return interpret_apply_status({...props, instruction})
        case "expend_action":
            return interpret_expend_action({...props, instruction})
        case "end_turn":
            return interpret_end_turn({...props, instruction})
        default:
            throw Error("instruction not implemented " + JSON.stringify(instruction))
    }
}