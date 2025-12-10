import {InstructionCleanContextStatus} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";

export const interpret_clean_context_status = ({turn_state}: InterpretInstructionProps<InstructionCleanContextStatus>) => {
    //TODO AP4 rename instruction since this is not longer called a context. Perhaps there is a better way to model this too.
    const context = turn_state.get_current_context()
    context.status = "none"
}
