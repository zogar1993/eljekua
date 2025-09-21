import {InstructionCleanContextStatus} from "expressions/tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";

export const interpret_clean_context_status = ({context}: InterpretInstructionProps<InstructionCleanContextStatus>) => {
    context.status = "none"
}
