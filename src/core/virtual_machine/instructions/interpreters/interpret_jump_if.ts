import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import type {InstructionJumpIf} from "core/virtual_machine/instructions/instructions";

export const interpret_jump_if = ({
                                        instruction,
                                        game_state,
                                        evaluate_ast
                                    }: InterpretInstructionProps<InstructionJumpIf>) => {
    const {vm_state} = game_state
    const result = EXPR.as_boolean(evaluate_ast(instruction.condition))
    if (result)
        vm_state.jump(instruction.offset)
    else
        vm_state.jump(1)
}