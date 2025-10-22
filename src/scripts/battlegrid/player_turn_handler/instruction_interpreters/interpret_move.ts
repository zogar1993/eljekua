import {get_reach_adjacent} from "scripts/battlegrid/ranges/get_reach_adjacent";
import {BASIC_ATTACK_ACTIONS} from "scripts/powers/basic";
import {
    Instruction,
    InstructionMovement
} from "scripts/expressions/tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {NODE} from "scripts/expressions/token_evaluator/NODE";
import {tokenize} from "scripts/expressions/tokenizer/tokenize";

export const interpret_move = ({
                                   instruction,
                                   context,
                                   battle_grid,
                                   turn_context
                               }: InterpretInstructionProps<InstructionMovement>) => {
    const target_creature_node = NODE.as_creature(context.get_variable(instruction.target))
    const target_creature = target_creature_node.value
    const destination_label = instruction.destination
    const path_node = NODE.as_positions(context.get_variable(destination_label))
    const path = path_node.value

    for (let i = 0; i < path.length - 1; i++) {
        const current_position = path[i]
        const potential_attackers = get_reach_adjacent({
            position: current_position,
            battle_grid
        })
            .filter(p => battle_grid.is_terrain_occupied(p))
            .map(battle_grid.get_creature_by_position)
            .filter(creature => creature !== target_creature)
            .filter(creature => creature.has_opportunity_action())

        if (potential_attackers.length === 0) {
            const new_position = path[i + 1]
            battle_grid.move_creature_one_square({creature: target_creature, position: new_position})
        } else {
            for (const attacker of potential_attackers) {
                //TODO P0 assert it cant be used in its own turn
                //TODO P0 seems to not be working correctly with big fellows
                const instructions = turn_power_into_opportunity_attack(BASIC_ATTACK_ACTIONS[0].instructions)
                const name = BASIC_ATTACK_ACTIONS[0].name
                turn_context.add_power_context({name, instructions, owner: attacker})
                turn_context.get_current_context().set_variable("primary_target", target_creature_node)
            }

            context.add_instructions([{type: "move", target: instruction.target, destination: instruction.destination}])
            context.set_variable(destination_label, {...path_node, value: path.slice(i)})
            break
        }
    }
}

const turn_power_into_opportunity_attack = (instructions: Array<Instruction>) =>
    add_option_for_opportunity_attack(remove_first_targeting(instructions))

const remove_first_targeting = (instructions: Array<Instruction>) => {
    if (instructions[0].type === "select_target")
        return instructions.slice(1)
    throw Error("targeting needed for removing it")
}

const add_option_for_opportunity_attack = (instructions: Array<Instruction>): Array<Instruction> => [
    {
        type: "options",
        options: [
            {
                text: "Opportunity Attack",
                //TODO P3 homogenize durations so that there is littler parsing
                instructions: [
                    {
                        type: "apply_status",
                        target: tokenize("owner"),
                        duration: ["until_start_of_next_turn"],
                        status: {type: "opportunity_action_used"}
                    },
                    ...instructions
                ]
            },
            {
                text: "Ignore",
                instructions: [
                    {
                //TODO P2 make it so that we can forgo opportunity attack for a whole movement
                        type: "apply_status",
                        target: tokenize("owner"),
                        duration: ["until_start_of_next_turn"],
                        status: {type: "opportunity_action_used"}
                    }
                ]
            },
        ],
    }
]
