import {InstructionCopyVariable} from "expressions/tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";

export const interpret_copy_variable = ({instruction, context}: InterpretInstructionProps<InstructionCopyVariable>) => {
    const variable = context.get_variable(instruction.origin)
    context.set_variable({type: variable.type, name: instruction.destination, value: variable.value} as Parameters<typeof context.set_variable>[0])
}