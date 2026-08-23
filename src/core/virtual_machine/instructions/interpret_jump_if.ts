import {
    InterpretInstructionProps
} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {InstructionJumpIf} from "core/virtual_machine/instructions/instructions";

export const interpret_jump_if = ({
                                        instruction,
                                        game_state,
                                        evaluate_ast
                                    }: InterpretInstructionProps<InstructionJumpIf>) => {
    const {turn_state} = game_state
    const result = EXPR.as_boolean(evaluate_ast(instruction.condition))
    if (result)
        turn_state.jump(instruction.offset)
    else
        turn_state.jump(1)
}