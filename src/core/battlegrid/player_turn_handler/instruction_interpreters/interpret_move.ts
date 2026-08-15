import {
    InterpretInstructionProps
} from "core/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {EXPR} from "core/expressions/evaluator/EXPR";
import {Expr} from "core/expressions/evaluator/types";
import {INSTRUCTION_TYPE, Instruction, InstructionMovement} from "core/expressions/parser/instructions";
import {SYSTEM_KEYWORD} from "core/expressions/parser/AST_NODE";

export const interpret_move = ({
                                   instruction,
                                   battle_grid,
                                   turn_state,
                                   evaluate_ast,
                               }: InterpretInstructionProps<InstructionMovement>) => {
    const moving_creature = EXPR.as_creature(turn_state.get_variable(instruction.target))
    const destination_label = instruction.destination
    const path = EXPR.as_positions(turn_state.get_variable(destination_label))
    turn_state.set_variable("trigger_activator", {type: "creatures", value: [moving_creature]})

    for (let i = 0; i < path.length - 1; i++) {
        // We exclude the ones who already were potential attackers for this power.
        // This is a little redundant in most cases, but without it, we wouldn't
        // disregard those who ignored the chance to make an opportunity attack.
        const excluded = turn_state.has_variable(SYSTEM_KEYWORD.EXCLUDED_FROM_REACTING) ?
            EXPR.as_creatures(turn_state.get_variable(SYSTEM_KEYWORD.EXCLUDED_FROM_REACTING)) : []

        const potential_attackers =
            battle_grid.creatures
                .filter(creature => creature !== moving_creature)
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
            moving_creature.data.position = new_position
            moving_creature.events.moved.raise({position: new_position, movement_type: "move"})
        } else {
            turn_state.set_variable(destination_label, {
                type: "positions",
                value: path.slice(i),
                description: "movement"
            })
            turn_state.add_instructions([{
                type: INSTRUCTION_TYPE.MOVE,
                target: instruction.target,
                destination: instruction.destination
            }])


            for (const {creature: attacker, powers} of potential_attackers) {
                const instructions: Array<Instruction> = [
                    {
                        type: INSTRUCTION_TYPE.OPTIONS,
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
                        value: [moving_creature]
                    }
                }
                turn_state.add_instruction_frame({instructions, owner: attacker, variables})
            }

            break
        }
    }
}