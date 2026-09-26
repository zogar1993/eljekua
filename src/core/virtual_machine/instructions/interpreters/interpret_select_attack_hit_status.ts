import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {INTERACTION_TYPE} from "core/interactions/Interactions";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import type {InstructionSelectAttackHitStatus} from "core/virtual_machine/instructions/instructions";

export const interpret_select_attack_hit_status = ({
                                                       game_state,
                                                       instruction,
                                                   }: InterpretInstructionProps<InstructionSelectAttackHitStatus>) => {
    const {vm_state, available_interaction} = game_state
    const defenders = EXPR.as_creatures(vm_state.get_variable(instruction.defender))

    available_interaction.set_available_interactions({
        type: INTERACTION_TYPE.HIT_STATUS_SELECT,
        creature_ids: defenders.map(defender => defender.id),
    })
}
