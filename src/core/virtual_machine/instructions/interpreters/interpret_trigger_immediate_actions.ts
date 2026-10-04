import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import type {InstructionTriggerImmediateActions} from "core/virtual_machine/instructions/instructions";
import {
    TRIGGER_INTERCEPTION,
} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {HIT_STATUS} from "core/virtual_machine/expressions/constants/HitStatus";
import type {Creature} from "core/battlegrid/creatures/Creature";
import type {GameState} from "core/game_state/GameState";
import {
    create_trigger_frame,
    get_potential_triggers,
    TRIGGER_VARIABLE,
} from "core/virtual_machine/instructions/trigger_reactions";

export const interpret_trigger_immediate_actions = ({
                                                        instruction,
                                                        game_state,
                                                        game_queries,
                                                    }: InterpretInstructionProps<InstructionTriggerImmediateActions>) => {
    if (!should_run_trigger({instruction, game_state})) return

    const activator = get_trigger_activator({instruction, game_state})
    const potential_triggers = get_potential_triggers({
        game_state,
        game_queries,
        activator,
        intercept: instruction.interception,
        timing: instruction.timing,
    })

    for (const {creature: trigger_owner, powers} of potential_triggers) {
        const frame = create_trigger_frame({activator, trigger_owner, powers})
        game_state.vm_state.add_scoped_instruction_frame(frame)
    }
}

const should_run_trigger = ({
                                instruction,
                                game_state,
                            }: {
    instruction: InstructionTriggerImmediateActions
    game_state: GameState
}): boolean => {
    if (instruction.interception !== TRIGGER_INTERCEPTION.CRITICAL_HIT) return true

    const attack_rolls = EXPR.as_attack_rolls(game_state.vm_state.get_variable(SYSTEM_KEYWORD.HIT_STATUS))

    return [...attack_rolls.values()].some(hit_status => hit_status === HIT_STATUS.CRIT)
}

const get_trigger_activator = ({
                                   instruction,
                                   game_state,
                               }: {
    instruction: InstructionTriggerImmediateActions
    game_state: GameState
}): Creature => {
    const {vm_state} = game_state

    if (instruction.interception === TRIGGER_INTERCEPTION.CRITICAL_HIT)
        return EXPR.as_creature(vm_state.get_variable(SYSTEM_KEYWORD.OWNER))

    if (vm_state.has_variable(TRIGGER_VARIABLE.ACTIVATOR))
        return EXPR.as_creature(vm_state.get_variable(TRIGGER_VARIABLE.ACTIVATOR))

    throw Error(`missing activator for "${instruction.interception}" trigger`)
}
