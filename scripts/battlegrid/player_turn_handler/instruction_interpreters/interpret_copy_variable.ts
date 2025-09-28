import {InstructionCopyVariable} from "expressions/tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";

//TODO this instruction can be removed if the variable and node systems are merged
export const interpret_copy_variable = ({instruction, context}: InterpretInstructionProps<InstructionCopyVariable>) => {
    const variable = context.get_variable(instruction.origin)
    context.set_variable(instruction.destination, variable)
}