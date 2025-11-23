import {InstructionCondition} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {EXPR} from "scripts/expressions/evaluator/EXPR";

export const interpret_condition = ({instruction, context, evaluate_ast}: InterpretInstructionProps<InstructionCondition>) => {
    const condition = EXPR.as_boolean(evaluate_ast(instruction.condition))
    context.add_instructions(condition.value ? instruction.instructions_true : instruction.instructions_false)
}