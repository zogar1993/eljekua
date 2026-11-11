import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import type {InstructionForceMovement} from "core/virtual_machine/instructions/instructions";
import {assert_unreachable} from "stdlib/assert";

export const interpret_force_movement = ({
                                             instruction,
                                             game_queries,
                                             game_events,
                                         }: InterpretInstructionProps<InstructionForceMovement>) => {
    const creature = game_queries.evaluate_creature(instruction.target)
    switch (instruction.movement_type) {
        case "push": {
            const destination = game_queries.evaluate_positions(instruction.destination)
            const position = destination[destination.length - 1]
            creature.data.position = position
            game_events.on_creature_moved.raise({creature, position, movement_type: "push"})
            break
        }
        default:
            assert_unreachable(`forced movement type '${instruction.movement_type}' not supported`)
    }
}