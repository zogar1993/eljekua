import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {InstructionSetPowerFrameHitStatus} from "scripts/expressions/parser/instructions";
import {SYSTEM_KEYWORD} from "scripts/expressions/parser/AST_NODE";

export const interpret_set_power_frame_hit_status = ({
                                                         instruction,
                                                         turn_state
                                                     }: InterpretInstructionProps<InstructionSetPowerFrameHitStatus>) => {
    turn_state.set_variable(SYSTEM_KEYWORD.HIT_STATUS, {type: "hit_status", value: instruction.value})
}
