import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import type {InstructionForceMovement} from "core/virtual_machine/instructions/instructions";

export const interpret_force_movement = ({
                                             instruction,
                                             game_queries,
                                             game_events,
                                         }: InterpretInstructionProps<InstructionForceMovement>) => {
    const creature = EXPR.as_creature(game_queries.evaluate(instruction.target))
    switch (instruction.movement_type) {
        case "push": {
            const destination = EXPR.as_positions(game_queries.evaluate(instruction.destination))
            const position = destination[destination.length - 1]
            creature.data.position = position
            game_events.on_creature_moved.raise({creature, position, movement_type: "push"})
            break
        }
        default:
            throw Error(`forced movement type '${instruction.movement_type}' not supported`)
    }
}