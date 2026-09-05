import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import type {
    Instruction,
    InstructionAttackRollConsequence,
    InstructionSaveVariable
} from "core/virtual_machine/instructions/instructions";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {HIT_STATUS} from "core/virtual_machine/expressions/constants/HitStatus";
import {create_trigger_frame, get_potential_triggers,} from "core/virtual_machine/instructions/trigger_reactions";
import {TRIGGER_INTERCEPTION} from "core/expressions/parser/transform_power_ir_into_vm_representation";

export const interpret_attack_roll_consequence = ({
                                                      game_state,
                                                      evaluate_ast,
                                                      instruction,
                                                      game_events,
                                                  }: InterpretInstructionProps<InstructionAttackRollConsequence>) => {
    const {vm_state} = game_state
instruction.defender
    const attack_rolls = EXPR.as_attack_rolls(vm_state.get_variable(SYSTEM_KEYWORD.HIT_STATUS))
    const entries = [...attack_rolls.entries()]

    const has_crit = entries.some(([_, hit_status]) => hit_status === HIT_STATUS.CRIT)

/* TODO fix how crit triggers work
    if (has_crit) {
        const activator = EXPR.as_creature(vm_state.get_variable(SYSTEM_KEYWORD.OWNER))

        const potential_triggers = get_potential_triggers({
            game_state,
            evaluate_ast,
            activator,
            intercept: TRIGGER_INTERCEPTION.CRITICAL_HIT,
        })

        for (const {creature: trigger_owner, powers} of potential_triggers) {
            const frame = create_trigger_frame({activator, trigger_owner, powers})
            vm_state.add_scoped_instruction_frame(frame)
        }
    }
*/
    const new_instructions: Array<Instruction> = []

    entries.forEach(([defender, hit_status]) => {
        new_instructions.push(save_variable_instruction(defender.id, instruction.defender))

        const is_hit = hit_status >= HIT_STATUS.HIT
        if (is_hit) {
            new_instructions.push(...instruction.hit)
        } else {
            game_events.on_creature_missed.raise(defender)
            new_instructions.push(...instruction.miss)
        }
    })

    vm_state.add_child_instruction_frame({instructions: new_instructions})
}

const save_variable_instruction = (origin: number, destination: string): InstructionSaveVariable => ({
    type: INSTRUCTION_TYPE.SAVE_VARIABLE,
    value: {type: "function", name: "creature_by_id", parameters: [{type: "number", value: origin}]},
    label: destination
})