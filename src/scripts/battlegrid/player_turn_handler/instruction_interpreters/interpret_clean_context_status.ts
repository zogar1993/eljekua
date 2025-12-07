import {InstructionCleanContextStatus} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";

export const interpret_clean_context_status = ({turn_context}: InterpretInstructionProps<InstructionCleanContextStatus>) => {
    const context = turn_context.get_current_context()
    context.status = "none"
}
