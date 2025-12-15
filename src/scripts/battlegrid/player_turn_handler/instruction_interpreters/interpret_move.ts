import {get_reach_adjacent} from "scripts/battlegrid/position/get_reach_adjacent";
import {BASIC_ATTACK_ACTIONS} from "scripts/powers/basic";
import {
    Instruction,
    InstructionMovement
} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {to_ast} from "scripts/expressions/parser/to_ast";
import {Expr} from "scripts/expressions/evaluator/types";

export const interpret_move = ({
                                   instruction,
                                   battle_grid,
                                   turn_state,
                               }: InterpretInstructionProps<InstructionMovement>) => {
    const mover_creature = EXPR.as_creature(turn_state.get_variable(instruction.target))
    const destination_label = instruction.destination
    const path = EXPR.as_positions(turn_state.get_variable(destination_label))

    for (let i = 0; i < path.length - 1; i++) {
        const current_position = path[i]
        const potential_attackers = [...new Set(
            get_reach_adjacent({origin: current_position, battle_grid})
                .filter(p => battle_grid.is_terrain_occupied(p))
                .map(battle_grid.get_creature_by_position)
                // Exclude self from opportunity attackers
                .filter(creature => creature !== mover_creature)
                // Exclude turn owner from opportunity attackers, since it can't take opportunity actions
                .filter(creature => creature !== turn_state.get_turn_owner())
                .filter(creature => creature.has_opportunity_action())
                //TODO P4 Maybe just remove opportunity action from creatures in their turns
        )]

        if (potential_attackers.length === 0) {
            const new_position = path[i + 1]
            battle_grid.move_creature_one_square({creature: mover_creature, position: new_position})
        } else {
            turn_state.set_variable(destination_label, {type: "positions", value: path.slice(i), description: "movement"})
            turn_state.add_instructions([{type: "move", target: instruction.target, destination: instruction.destination}])

            for (const attacker of potential_attackers) {
                //TODO P1 allow for any attack that can be a melee basic attack
                const instructions = turn_power_into_opportunity_attack(BASIC_ATTACK_ACTIONS[0].instructions)
                const name = BASIC_ATTACK_ACTIONS[0].name

                const variables: Record<string, Expr> = {"primary_target": {type: "creatures", value: [mover_creature]}}
                turn_state.add_power_frame({name, instructions, owner: attacker, variables})
            }

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
                //TODO AP3 homogenize durations so that there is littler parsing
                instructions: [
                    {
                        type: "apply_status",
                        target: to_ast("owner"),
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
                        target: to_ast("owner"),
                        duration: ["until_start_of_next_turn"],
                        status: {type: "opportunity_action_used"}
                    }
                ]
            },
        ],
    }
]
