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

//TODO this should change to not ad more frames and instead work as a plain bytecode
export const interpret_attack_roll_consequence = ({
                                                      game_state,
                                                      instruction,
                                                      game_events,
                                                  }: InterpretInstructionProps<InstructionAttackRollConsequence>) => {
    const {vm_state} = game_state
    const attack_rolls = EXPR.as_attack_rolls(vm_state.get_variable(SYSTEM_KEYWORD.HIT_STATUS))
    const entries = [...attack_rolls.entries()]

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