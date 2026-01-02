import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {Instruction, InstructionAddPowers} from "scripts/expressions/parser/instructions";
import {AstNode} from "scripts/expressions/parser/nodes/AstNode";

export const interpret_add_powers = ({
                                         instruction,
                                         turn_state,
                                         evaluate_ast
                                     }: InterpretInstructionProps<InstructionAddPowers>) => {
    const creature = EXPR.as_creature(evaluate_ast(instruction.creature))

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
                    condition: {
                        type: "function",
                        name: "and",
                        parameters: [
                            {
                                type: "function",
                                name: "has_valid_targets",
                                parameters: [{type: "keyword", value: power_name}]
                            },
                            {
                                type: "function",
                                name: "can_expend_action_type",
                                parameters: [instruction.creature, {type: "string", value: power.type.action}]
                            }
                        ]
                    } as AstNode
                }
            }),
            {
                text: "End turn",
                instructions: [
                    {
                        type: "end_turn"
                    }
                ],
            }
        ]
    }])
}