import {InstructionSaveResolvedNumber} from "expressions/tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {resolve_number} from "expressions/token_evaluator/evaluate_token";
import {NODE} from "expressions/token_evaluator/NODE";

export const interpret_save_resolved_number = ({
                                                   instruction,
                                                   context,
                                                   evaluate_token
                                               }: InterpretInstructionProps<InstructionSaveResolvedNumber>) => {
    const value = resolve_number(NODE.as_number(evaluate_token(instruction.value)))
    context.set_resolved_number({name: instruction.label, value})
}