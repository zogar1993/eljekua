import {InstructionSaveResolvedNumber} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {resolve_number} from "scripts/expressions/evaluator/number_utils";

export const interpret_save_resolved_number = ({
                                                   instruction,
                                                   context,
                                                   evaluate_ast
                                               }: InterpretInstructionProps<InstructionSaveResolvedNumber>) => {
    const value = resolve_number(EXPR.as_number_expr(evaluate_ast(instruction.value)))
    context.set_variable(instruction.label, value)
}