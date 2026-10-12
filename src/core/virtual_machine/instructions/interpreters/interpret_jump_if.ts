import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import type {InstructionJumpIf} from "core/virtual_machine/instructions/instructions";

export const interpret_jump_if = ({
                                        instruction,
                                        game_state,
                                        game_queries
                                    }: InterpretInstructionProps<InstructionJumpIf>) => {
    const {vm_state} = game_state
    const result = game_queries.evaluate_boolean(instruction.condition)
    if (result)
        vm_state.jump(instruction.offset)
    else
        vm_state.jump(1)
}