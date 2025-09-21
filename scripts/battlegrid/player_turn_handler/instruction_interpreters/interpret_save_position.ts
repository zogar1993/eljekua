import {InstructionSavePosition} from "expressions/tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";

export const interpret_save_position = ({instruction, context}: InterpretInstructionProps<InstructionSavePosition>) => {
    const target = context.get_creature(instruction.target)
    context.set_variable({type: "position", name: instruction.label, value: target.data.position})
}