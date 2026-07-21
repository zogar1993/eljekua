import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {Expr} from "scripts/expressions/evaluator/types";
import {Instruction, InstructionMovement} from "scripts/expressions/parser/instructions";
import {SYSTEM_KEYWORD} from "scripts/expressions/parser/AST_NODE";

export const interpret_move = ({
                                   instruction,
                                   battle_grid,
                                   turn_state,
                                   evaluate_ast,
                               }: InterpretInstructionProps<InstructionMovement>) => {
    const mover_creature = EXPR.as_creature(turn_state.get_variable(instruction.target))
    const destination_label = instruction.destination
    const path = EXPR.as_positions(turn_state.get_variable(destination_label))
    turn_state.set_variable("trigger_activator", {type: "creatures", value: [mover_creature]})

    for (let i = 0; i < path.length - 1; i++) {
        // We exclude the ones who already were potential attackers for this power.
        // This is a little redundant in most cases, but without it, we wouldn't
        // disregard those who ignored the chance to make an opportunity attack.
        const excluded = turn_state.has_variable(SYSTEM_KEYWORD.EXCLUDED_FROM_REACTING) ?
            EXPR.as_creatures(turn_state.get_variable(SYSTEM_KEYWORD.EXCLUDED_FROM_REACTING)) : []

        const potential_attackers =
            battle_grid.creatures
                .filter(creature => creature !== mover_creature)
                .filter(creature => !excluded.includes(creature))
                .map(creature => {
                    turn_state.set_variable("trigger_owner", {type: "creatures", value: [creature]})
                    const powers = creature.data.powers.filter(power => {
                        if (!power.trigger) return false
                        if (!power.trigger.intercepts.includes("movement")) return false
                        if (!creature.has_action_available(power.type.action)) return false
                        return power.trigger.conditions.every(condition => EXPR.as_boolean(evaluate_ast(condition)))
                    })
                    return {creature, powers}
                })
                .filter(({powers}) => powers.length > 0)

        const new_excluded = [...excluded, ...potential_attackers.map(({creature}) => creature)]
        turn_state.set_variable(SYSTEM_KEYWORD.EXCLUDED_FROM_REACTING, {type: "creatures", value: new_excluded})

        if (potential_attackers.length === 0) {
            const new_position = path[i + 1]
            mover_creature.data.position = new_position
            mover_creature.events.moved.raise({position: new_position, movement_type: "move"})
        } else {
            turn_state.set_variable(destination_label, {
                type: "positions",
                value: path.slice(i),
                description: "movement"
            })
            turn_state.add_instructions([{
                type: "move",
                target: instruction.target,
                destination: instruction.destination
            }])


            for (const {creature: attacker, powers} of potential_attackers) {
                const instructions: Array<Instruction> = [
                    {
                        type: "options",
                        options: [
                            ...powers.map(power => ({
                                text: power.name,
                                instructions: power.instructions
                            })),
                            {
                                text: "Ignore",
                                instructions: []
                            }
                        ]
                    },
                ]
                const variables: Record<string, Expr> = {
                    [SYSTEM_KEYWORD.TRIGGERER]: {
                        type: "creatures",
                        value: [mover_creature]
                    }
                }
                turn_state.add_power_frame({name: "Select Trigger", instructions, owner: attacker, variables})
            }

            break
        }
    }
}