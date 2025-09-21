import {interpret_token} from "interpreter/interpret_token";
import {InstructionCondition} from "tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {NODE} from "interpreter/NODE";

export const interpret_condition = ({instruction, context, player_turn_handler}: InterpretInstructionProps<InstructionCondition>) => {
    const condition = NODE.as_boolean(interpret_token({token: instruction.condition, context, player_turn_handler}))
    context.add_instructions(condition.value ? instruction.instructions_true : instruction.instructions_false)
}