import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import type {InstructionJump} from "core/virtual_machine/instructions/instructions";

export const interpret_jump = ({
                                        instruction,
                                        game_state,
                                    }: InterpretInstructionProps<InstructionJump>) => {
    const {vm_state} = game_state
    vm_state.jump(instruction.offset)
}