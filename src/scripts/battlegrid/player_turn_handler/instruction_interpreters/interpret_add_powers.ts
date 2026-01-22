import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {Instruction, InstructionAddPowers} from "scripts/expressions/parser/instructions";
import {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import {TURN_ACTION_TYPES} from "scripts/battlegrid/creatures/ActionType";
import {PowerVM} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";

//TODO rename into "add powers to select from" or something like it
export const interpret_add_powers = ({
                                         instruction,
                                         turn_state,
                                         evaluate_ast
                                     }: InterpretInstructionProps<InstructionAddPowers>) => {
    const creature = EXPR.as_creature(evaluate_ast(instruction.creature))
    const filtered_powers = filter_powers({powers: creature.data.powers, filter: instruction.filter})

    turn_state.add_instructions([{
        type: "options",
        options: [
            ...filtered_powers.map(power => {
                const power_name = `power_${power.name.replaceAll(" ", "_").toLowerCase()}`
                turn_state.set_variable(power_name, {type: "power", value: power})
                return {
                    text: power.name,
                    instructions: [
                        {
                            type: "expend_action",
                            action_type: instruction.cost === "opportunity" ? "opportunity" : power.type.action
                        },
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
                                name: "has_valid_targeting",
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

const filter_powers = ({powers, filter}: { powers: Array<PowerVM>, filter: InstructionAddPowers["filter"] }) => {
    switch (filter) {
        case "turn":
            return powers.filter(power => TURN_ACTION_TYPES.includes(power.type.action))
        case "melee_basic_attack":
            return powers.filter(power => power.type.traits.includes("melee_basic_attack"))
        default:
            throw Error(`Can't filter but trait '${filter}'`)
    }
}