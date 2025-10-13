import {InstructionSaveResolvedNumber} from "scripts/expressions/tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {NODE} from "scripts/expressions/token_evaluator/NODE";
import {resolve_number} from "scripts/expressions/token_evaluator/number_utils";

export const interpret_save_resolved_number = ({
                                                   instruction,
                                                   context,
                                                   evaluate_token
                                               }: InterpretInstructionProps<InstructionSaveResolvedNumber>) => {
    const value = resolve_number(NODE.as_number(evaluate_token(instruction.value)))
    context.set_variable(instruction.label, value)
}