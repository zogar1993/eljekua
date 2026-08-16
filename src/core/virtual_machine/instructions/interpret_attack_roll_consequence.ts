import {
    InterpretInstructionProps
} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {
    INSTRUCTION_TYPE,
    Instruction,
    InstructionAttackRollConsequence,
    InstructionSaveVariable
} from "core/virtual_machine/instructions/instructions";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {HIT_STATUS} from "core/battlegrid/player_turn_handler/HitStatus";

export const interpret_attack_roll_consequence = (props: InterpretInstructionProps<InstructionAttackRollConsequence>) => {
    const {instruction, turn_state, game_events} = props
    const attack_rolls = EXPR.as_attack_rolls(turn_state.get_variable(SYSTEM_KEYWORD.HIT_STATUS))
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

    turn_state.add_instructions(new_instructions)
}

const save_variable_instruction = (origin: number, destination: string): InstructionSaveVariable => ({
    type: INSTRUCTION_TYPE.SAVE_VARIABLE,
    value: {type: "function", name: "creature_by_id", parameters: [{type: "number", value: origin}]},
    label: destination
})