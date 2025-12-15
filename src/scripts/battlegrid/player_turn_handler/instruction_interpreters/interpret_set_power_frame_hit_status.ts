import {InstructionSetPowerFrameHitStatus} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";

export const interpret_set_power_frame_hit_status = ({
                                                         instruction,
                                                         turn_state
                                                     }: InterpretInstructionProps<InstructionSetPowerFrameHitStatus>) => {
    turn_state.set_hit_status(instruction.value)
}
