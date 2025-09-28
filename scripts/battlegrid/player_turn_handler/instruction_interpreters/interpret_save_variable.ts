import {InstructionSaveVariable} from "expressions/tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";

export const interpret_save_variable = ({instruction, context, evaluate_token}: InterpretInstructionProps<InstructionSaveVariable>) => {
    const node = evaluate_token(instruction.value)
    context.set_variable(instruction.label, node)
}
