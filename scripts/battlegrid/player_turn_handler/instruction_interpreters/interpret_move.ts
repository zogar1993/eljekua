import {get_adjacent} from "battlegrid/ranges/get_adyacent";
import {BASIC_ATTACK_ACTIONS} from "powers/basic";
import {Instruction, InstructionMovement} from "tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";

export const interpret_move = ({
                                   instruction,
                                   context,
                                   battle_grid,
                                   turn_context
                               }: InterpretInstructionProps<InstructionMovement>) => {
    const creature = context.get_creature(instruction.target)
    let path = context.get_path(instruction.destination)

    for (let i = 0; i < path.length - 1; i++) {
        const current_position = path[i]
        const potential_attackers = get_adjacent({
            position: current_position,
            battle_grid
        })
            .filter(battle_grid.is_terrain_occupied)
            .map(battle_grid.get_creature_by_position)
            .filter(turn_context.has_opportunity_action)

        if (potential_attackers.length === 0) {
            const new_position = path[i + 1]
            battle_grid.move_creature_one_square({creature, position: new_position})
        } else {
            for (const attacker of potential_attackers) {
                const instructions = turn_power_into_opportunity_attack(BASIC_ATTACK_ACTIONS[0].instructions)
                const name = BASIC_ATTACK_ACTIONS[0].name
                turn_context.add_power_context({name, instructions, owner: attacker})
                turn_context.get_current_context().set_creature({name: "primary_target", value: creature})

                turn_context.expend_opportunity_action(attacker)
            }

            context.add_instructions([{type: "move", target: instruction.target, destination: instruction.destination}])
            context.set_path({name: instruction.destination, value: path.slice(i)})
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
            {text: "Opportunity Attack", instructions},
            {text: "Ignore", instructions: []},
        ],
    }
]
