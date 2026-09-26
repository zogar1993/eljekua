import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {INTERACTION_TYPE} from "core/interactions/Interactions";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import type {InstructionSelectAttackHitStatus} from "core/virtual_machine/instructions/instructions";

export const interpret_select_attack_hit_status = ({
                                                       game_state,
                                                       player_turn_handler,
                                                       instruction,
                                                   }: InterpretInstructionProps<InstructionSelectAttackHitStatus>) => {
    const {vm_state} = game_state
    const defenders = EXPR.as_creatures(vm_state.get_variable(instruction.defender))

    player_turn_handler.set_available_interactions({
        type: INTERACTION_TYPE.HIT_STATUS_SELECT,
        creature_ids: defenders.map(defender => defender.id),
    })
}
