import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {
    Instruction,
    InstructionAttackRollConsequence,
    InstructionSaveVariable
} from "scripts/expressions/parser/instructions";
import {SYSTEM_KEYWORD} from "scripts/expressions/parser/AST_NODE";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {HIT_STATUS} from "scripts/battlegrid/player_turn_handler/HitStatus";

export const interpret_attack_roll_consequence = (props: InterpretInstructionProps<InstructionAttackRollConsequence>) => {
    const {instruction, turn_state} = props
    const attack_rolls = EXPR.as_attack_rolls(turn_state.get_variable(SYSTEM_KEYWORD.HIT_STATUS))
    const entries = [...attack_rolls.entries()]


    const new_instructions: Array<Instruction> = []

    entries.forEach(([defender, hit_status], i) => {
        const is_hit = hit_status >= HIT_STATUS.HIT

        //TODO this could be shortened with a dedicated instruction
        const defender_label = `${instruction.defender}(${i})`
        turn_state.set_variable(defender_label, {type: "creatures", value: [defender]})
        new_instructions.push(save_variable_instruction(defender_label, instruction.defender))

        if (is_hit) {
            new_instructions.push(...instruction.hit)
        } else {
            defender.events.is_missed.raise()
            new_instructions.push(...instruction.miss)
        }

    })

    turn_state.add_instructions(new_instructions)
}

const save_variable_instruction = (origin: string, destination: string): InstructionSaveVariable =>
    ({type: "save_variable", value: {type: "keyword", value: origin}, label: destination})