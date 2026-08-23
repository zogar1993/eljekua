import {
    InterpretInstructionProps
} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {InstructionJump} from "core/virtual_machine/instructions/instructions";

export const interpret_jump = ({
                                        instruction,
                                        game_state,
                                    }: InterpretInstructionProps<InstructionJump>) => {
    const {turn_state} = game_state
    turn_state.jump(instruction.offset)
}