import {
    InterpretInstructionProps
} from "core/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {EXPR} from "core/expressions/evaluator/EXPR";
import {InstructionMovement} from "core/expressions/parser/instructions";

export const interpret_shift = ({
                                    instruction,
                                    turn_state,
                                }: InterpretInstructionProps<InstructionMovement>) => {
    const creature = EXPR.as_creature(turn_state.get_variable(instruction.target))
    const path = EXPR.as_positions(turn_state.get_variable(instruction.destination))
    for (const position of path) {
        creature.data.position = position
        creature.events.moved.raise({position, movement_type: "move"})
    }
}