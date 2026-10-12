import type {Creature} from "core/battlegrid/creatures/Creature";
import type {HitStatus} from "core/virtual_machine/expressions/constants/HitStatus";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import type {InstructionSetHitStatus} from "core/virtual_machine/instructions/instructions";

export const interpret_set_hit_status = ({
                                             instruction,
                                             game_state,
                                             game_queries,
                                         }: InterpretInstructionProps<InstructionSetHitStatus>) => {
    const {vm_state} = game_state
    const target = game_queries.evaluate_creature(vm_state.get_variable(instruction.target_label))

    const attack_rolls: Map<Creature, HitStatus> = vm_state.has_variable(SYSTEM_KEYWORD.HIT_STATUS) ?
         game_queries.evaluate_attack_rolls(vm_state.get_variable(SYSTEM_KEYWORD.HIT_STATUS)) :
         new Map()

    attack_rolls.set(target, instruction.status)
    vm_state.set_variable(SYSTEM_KEYWORD.HIT_STATUS, {type: "attack_rolls", value: attack_rolls})
}
