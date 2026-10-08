import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import type {InstructionTriggerCriticalRollReaction} from "core/virtual_machine/instructions/instructions";
import {
    TRIGGER_INTERCEPTION,
    TRIGGER_TIMING,
} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {HIT_STATUS} from "core/virtual_machine/expressions/constants/HitStatus";
import {offer_trigger_reactions} from "core/virtual_machine/instructions/trigger_reactions";

export const interpret_trigger_critical_roll_reaction = ({
                                                             game_state,
                                                             game_queries,
                                                         }: InterpretInstructionProps<InstructionTriggerCriticalRollReaction>) => {
    const attack_rolls = EXPR.as_attack_rolls(game_state.vm_state.get_variable(SYSTEM_KEYWORD.HIT_STATUS))
    const has_critical_hit = [...attack_rolls.values()].some(hit_status => hit_status === HIT_STATUS.CRIT)

    if (!has_critical_hit) return

    const activator = EXPR.as_creature(game_state.vm_state.get_variable(SYSTEM_KEYWORD.OWNER))

    offer_trigger_reactions({
        game_state,
        game_queries,
        activator,
        intercept: TRIGGER_INTERCEPTION.CRITICAL_HIT,
        timing: TRIGGER_TIMING.REACTION,
    })
}
