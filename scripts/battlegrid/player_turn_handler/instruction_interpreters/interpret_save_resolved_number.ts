import {InstructionSaveResolvedNumber} from "tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {resolve_number, interpret_token} from "interpreter/interpret_token";
import {NODE} from "interpreter/NODE";

export const interpret_save_resolved_number = ({
                                                   instruction,
                                                   context
                                               }: InterpretInstructionProps<InstructionSaveResolvedNumber>) => {
    const value = resolve_number(NODE.as_number(interpret_token({token: instruction.value, context})))
    context.set_resolved_number({name: instruction.label, value})
}