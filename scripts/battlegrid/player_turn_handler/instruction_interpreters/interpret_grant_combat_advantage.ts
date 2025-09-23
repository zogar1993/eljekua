import {
    InstructionCleanContextStatus,
    InstructionGrantCombatAdvantage
} from "expressions/tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {evaluate_token} from "expressions/token_evaluator/evaluate_token";
import {NODE} from "expressions/token_evaluator/NODE";

export const interpret_grant_combat_advantage = ({
                                                     instruction,
                                                     player_turn_handler
                                                 }: InterpretInstructionProps<InstructionGrantCombatAdvantage>) => {
    const target = NODE.as_creature(evaluate_token({token: instruction.target, player_turn_handler})).value
    const beneficiaries = NODE.as_creatures(evaluate_token({token: instruction.beneficiaries, player_turn_handler})).value

    target.add_status({type: "grants_combat_advantage", beneficiaries, duration: instruction.duration})
}
