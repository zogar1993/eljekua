import {
    InterpretInstructionProps
} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {InstructionCondition} from "core/virtual_machine/instructions/instructions";

export const interpret_condition = ({
                                        instruction,
                                        game_state,
                                        evaluate_ast
                                    }: InterpretInstructionProps<InstructionCondition>) => {
    const {turn_state} = game_state
    const result = EXPR.as_boolean(evaluate_ast(instruction.condition))
    turn_state.add_instructions(result ? instruction.instructions_true : instruction.instructions_false)
}