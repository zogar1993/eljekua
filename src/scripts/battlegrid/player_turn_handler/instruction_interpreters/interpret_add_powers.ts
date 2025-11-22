import {Instruction, InstructionAddPowers} from "scripts/expressions/tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {tokenize} from "scripts/expressions/tokenizer/tokenize";
import {NODE} from "scripts/expressions/token_evaluator/NODE";

export const interpret_add_powers = ({
                                         instruction,
                                         context,
                                     }: InterpretInstructionProps<InstructionAddPowers>) => {
    const creature = NODE.as_creature(context.get_variable(instruction.creature))

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
                    condition: tokenize(`$has_valid_targets(${power_name})`)
                }
            }),
            {
                text: "Cancel",
                instructions: [],
            }
        ]
    }])
}