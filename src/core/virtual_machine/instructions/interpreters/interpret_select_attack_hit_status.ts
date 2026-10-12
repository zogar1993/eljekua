import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {INTERACTION_TYPE} from "core/interactions/Interactions";
import type {InstructionSelectAttackHitStatus} from "core/virtual_machine/instructions/instructions";

export const interpret_select_attack_hit_status = ({
                                                       game_state,
                                                       instruction,
                                                       game_queries,
                                                   }: InterpretInstructionProps<InstructionSelectAttackHitStatus>) => {
    const {vm_state, available_interaction} = game_state
    const defenders = game_queries.evaluate_creatures(vm_state.get_variable(instruction.defender_label))

    available_interaction.set_available_interactions({
        type: INTERACTION_TYPE.HIT_STATUS_SELECT,
        creature_ids: defenders.map(defender => defender.id),
    })
}
