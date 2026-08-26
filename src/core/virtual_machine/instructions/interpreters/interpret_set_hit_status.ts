import type {Creature} from "core/battlegrid/creatures/Creature";
import type {HitStatus} from "core/virtual_machine/expressions/constants/HitStatus";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import type {InstructionSetHitStatus} from "core/virtual_machine/instructions/instructions";

export const interpret_set_hit_status = ({
                                             instruction,
                                             game_state,
                                         }: InterpretInstructionProps<InstructionSetHitStatus>) => {
    const {vm_state} = game_state
    const target = EXPR.as_creature(vm_state.get_variable(instruction.target))

    const hit_statuses: Map<Creature, HitStatus> = vm_state.has_variable(SYSTEM_KEYWORD.HIT_STATUS) ?
         EXPR.as_attack_rolls(vm_state.get_variable(SYSTEM_KEYWORD.HIT_STATUS)) :
         new Map()

    hit_statuses.set(target, instruction.status)
    vm_state.set_variable(SYSTEM_KEYWORD.HIT_STATUS, {type: "attack_rolls", value: hit_statuses})
}
