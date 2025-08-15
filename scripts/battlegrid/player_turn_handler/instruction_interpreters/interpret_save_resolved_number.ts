import {InstructionSaveResolvedNumber} from "tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {NODE, resolve_number, token_to_node} from "expression_parsers/token_to_node";

export const interpret_save_resolved_number = ({
                                                   instruction,
                                                   context
                                               }: InterpretInstructionProps<InstructionSaveResolvedNumber>) => {
    const value = resolve_number(NODE.as_number(token_to_node({token: instruction.value, context})))
    context.set_resolved_number({name: instruction.label, value})
}