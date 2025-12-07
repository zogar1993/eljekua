import {Instruction, InstructionAddPowers} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {to_ast} from "scripts/expressions/parser/to_ast";
import {EXPR} from "scripts/expressions/evaluator/EXPR";

export const interpret_add_powers = ({
                                         instruction,
                                         turn_state,
                                     }: InterpretInstructionProps<InstructionAddPowers>) => {
    const context = turn_state.get_current_context()
    const creature = EXPR.as_creature(context.get_variable(instruction.creature))

    context.add_instructions([{
        type: "options",
        options: [
            ...creature.data.powers.map(power => {
                const power_name = `power_${power.name.replaceAll(" ", "_").toLowerCase()}`
                context.set_variable(power_name, {type: "power", value: power})
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