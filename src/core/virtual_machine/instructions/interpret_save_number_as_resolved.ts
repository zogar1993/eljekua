import {
    InterpretInstructionProps
} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {EXPR} from "core/expressions/evaluator/EXPR";
import {resolve_number} from "core/expressions/evaluator/number_utils";
import {InstructionSaveResolvedNumber} from "core/virtual_machine/instructions/instructions";

export const interpret_save_number_as_resolved = ({
                                                      instruction,
                                                      turn_state,
                                                      evaluate_ast
                                                  }: InterpretInstructionProps<InstructionSaveResolvedNumber>) => {
    const value = resolve_number(EXPR.as_number_expr(evaluate_ast(instruction.value)))
    turn_state.set_variable(instruction.label, value)
}