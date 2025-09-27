import {InstructionCondition} from "expressions/tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {NODE} from "expressions/token_evaluator/NODE";

export const interpret_condition = ({instruction, context, evaluate_token}: InterpretInstructionProps<InstructionCondition>) => {
    const condition = NODE.as_boolean(evaluate_token(instruction.condition))
    context.add_instructions(condition.value ? instruction.instructions_true : instruction.instructions_false)
}