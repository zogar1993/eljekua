import {interpret_select_target} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_select_target";
import {interpret_attack_roll} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_attack_roll";
import {interpret_apply_damage} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_apply_damage";
import {interpret_move} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_move";
import {interpret_shift} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_shift";
import {interpret_force_movement} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_force_movement";
import {interpret_save_variable} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_save_variable";
import {interpret_options} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_options";
import {interpret_condition} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_condition";
import type {Instruction} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";
import type {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {
    interpret_save_resolved_number
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_save_resolved_number";
import {interpret_execute_power} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_execute_power";
import {interpret_add_powers} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_add_powers";
import {
    interpret_clean_context_status
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_clean_context_status";
import {
    interpret_apply_status
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_apply_status";

export const interpret_instruction = (props: InterpretInstructionProps<Instruction>) => {
    const {instruction} = props
    switch (instruction.type) {
        case "select_target":
            interpret_select_target({...props, instruction})
            break
        case "attack_roll":
            interpret_attack_roll({...props, instruction})
            break
        case "apply_damage":
            interpret_apply_damage({...props, instruction})
            break
        case "move":
            interpret_move({...props, instruction})
            break
        case "shift":
            interpret_shift({...props, instruction})
            break
        case "force_movement":
            interpret_force_movement({...props, instruction})
            break
        case "save_variable":
            interpret_save_variable({...props, instruction})
            break
        case "save_resolved_number":
            interpret_save_resolved_number({...props, instruction})
            break
        case "options":
            interpret_options({...props, instruction})
            break;
        case "condition":
            interpret_condition({...props, instruction})
            break
        case "add_powers":
            interpret_add_powers({...props, instruction})
            break
        case "execute_power":
            interpret_execute_power({...props, instruction})
            break
        case "clean_context_status":
            interpret_clean_context_status({...props, instruction})
            break
        case "apply_status":
            interpret_apply_status({...props, instruction})
            break
        default:
            throw Error("instruction not implemented " + JSON.stringify(instruction))
    }
}