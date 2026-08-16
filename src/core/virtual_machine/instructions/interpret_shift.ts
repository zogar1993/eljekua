import {
    InterpretInstructionProps
} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {InstructionMovement} from "core/virtual_machine/instructions/instructions";

export const interpret_shift = ({
                                    instruction,
                                    turn_state,
                                    game_events,
                                }: InterpretInstructionProps<InstructionMovement>) => {
    const creature = EXPR.as_creature(turn_state.get_variable(instruction.target))
    const path = EXPR.as_positions(turn_state.get_variable(instruction.destination))
    for (const position of path) {
        creature.data.position = position
        game_events.on_creature_moved.raise({creature, position, movement_type: "move"})
    }
}