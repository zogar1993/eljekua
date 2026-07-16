import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {Instruction, InstructionAddPowers, InstructionOptionsItem} from "scripts/expressions/parser/instructions";
import {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import {TURN_ACTION_TYPES} from "scripts/battlegrid/creatures/ActionType";
import {Power} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";
import {remove_from_array_by_index} from "scripts/ts_utils/remove_from_array_by_index";
import {SYSTEM_KEYWORD} from "scripts/expressions/parser/AST_NODE";

export const interpret_add_powers_as_options = ({
                                                    instruction,
                                                    turn_state,
                                                    evaluate_ast
                                                }: InterpretInstructionProps<InstructionAddPowers>) => {
    const creature = EXPR.as_creature(evaluate_ast(instruction.creature))
    const filtered_powers = filter_powers({powers: creature.data.powers, filter: instruction.filter})

    const options: Array<InstructionOptionsItem> = []

    for (const power of filtered_powers) {
        const power_name = `power_${power.name.replaceAll(" ", "_").toLowerCase()}`
        const is_opportunity_attack = instruction.cost === "opportunity"
        const action_type_cost = is_opportunity_attack ? "opportunity" : power.type.action
        const initialization = is_opportunity_attack ? [{
            from: SYSTEM_KEYWORD.TRIGGERER,
            to: SYSTEM_KEYWORD.PRIMARY_TARGET
        }] : []
        const instructions: Array<Instruction> = [
            {type: "expend_action", action_type: action_type_cost},
            {type: "execute_power", power: power_name, initialization}
        ]
        const condition: AstNode = {
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
                    parameters: [instruction.creature, {type: "string", value: action_type_cost}]
                }
            ]
        }

        if (is_opportunity_attack) {
            const modified_power = {...power, instructions: remove_default_targeting_instruction(power.instructions)}
            turn_state.set_variable(power_name, {type: "power", value: modified_power})
        } else {
            turn_state.set_variable(power_name, {type: "power", value: power})
        }

        options.push({text: power.name, instructions, condition})
    }

    turn_state.add_instructions([{
        type: "options",
        options: [
            ...options,
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

const filter_powers = ({powers, filter}: { powers: Array<Power>, filter: InstructionAddPowers["filter"] }) => {
    switch (filter) {
        case "turn":
            return powers.filter(power => TURN_ACTION_TYPES.includes(power.type.action))
        case "melee_basic_attack":
            return powers.filter(power => power.type.traits.includes("melee_basic_attack"))
        default:
            throw Error(`Can't filter but trait '${filter}'`)
    }
}

const remove_default_targeting_instruction = (instructions: Array<Instruction>) => {
    const index = instructions.findIndex(instruction =>
        instruction.type === "select_target" &&
        instruction.target_label === SYSTEM_KEYWORD.PRIMARY_TARGET
    )
    if (index === -1) return instructions
    return remove_from_array_by_index(instructions, index)
}