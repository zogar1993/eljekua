import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {InstructionSetPowerFrameHitStatus} from "scripts/expressions/parser/instructions";

export const interpret_set_power_frame_hit_status = ({
                                                         instruction,
                                                         turn_state
                                                     }: InterpretInstructionProps<InstructionSetPowerFrameHitStatus>) => {
    turn_state.set_hit_status(instruction.value)
}
