import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {INTERACTION_TYPE} from "core/interactions/Interactions";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import type {InstructionSelectAttackD20Roll} from "core/virtual_machine/instructions/instructions";

export const interpret_select_attack_d20_roll = ({
                                                     game_state,
                                                     player_turn_handler,
                                                     instruction,
                                                 }: InterpretInstructionProps<InstructionSelectAttackD20Roll>) => {
    const {vm_state} = game_state
    const defenders = EXPR.as_creatures(vm_state.get_variable(instruction.defender))

    player_turn_handler.set_available_interactions({
        type: INTERACTION_TYPE.D20_ROLL_SELECT,
        creature_ids: defenders.map(defender => defender.id),
    })
}
