import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {to_ast} from "scripts/expressions/parser/to_ast";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {Instruction, InstructionAddPowers} from "scripts/expressions/parser/instructions";

export const interpret_add_powers = ({
                                         instruction,
                                         turn_state,
                                     }: InterpretInstructionProps<InstructionAddPowers>) => {
    const creature = EXPR.as_creature(turn_state.get_variable(instruction.creature))

    turn_state.add_instructions([{
        type: "options",
        options: [
            ...creature.data.powers.map(power => {
                const power_name = `power_${power.name.replaceAll(" ", "_").toLowerCase()}`
                turn_state.set_variable(power_name, {type: "power", value: power})
                return {
                    text: power.name,
                    instructions: [
                        {
                            type: "execute_power",
                            power: power_name
                        }
                    ] as Array<Instruction>,
                    condition: to_ast(`$has_valid_targets(${power_name})`)
                }
            }),
            {
                text: "Cancel",
                instructions: [],
            }
        ]
    }])
}