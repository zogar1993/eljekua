import {InstructionCondition} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {EXPR} from "scripts/expressions/evaluator/EXPR";

export const interpret_condition = ({
                                        instruction,
                                        turn_context,
                                        evaluate_ast
                                    }: InterpretInstructionProps<InstructionCondition>) => {
    const context = turn_context.get_current_context()
    const result = EXPR.as_boolean(evaluate_ast(instruction.condition))
    context.add_instructions(result ? instruction.instructions_true : instruction.instructions_false)
}