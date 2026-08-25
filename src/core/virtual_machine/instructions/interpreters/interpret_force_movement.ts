import {
    InterpretInstructionProps
} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {InstructionForceMovement} from "core/virtual_machine/instructions/instructions";

export const interpret_force_movement = ({
                                             instruction,
                                             game_state,
                                             evaluate_ast
                                         }: InterpretInstructionProps<InstructionForceMovement>) => {
    const {battle_grid} = game_state
    const creature = EXPR.as_creature(evaluate_ast(instruction.target))
    switch (instruction.movement_type) {
        case "push": {
            const destination = EXPR.as_positions(evaluate_ast(instruction.destination))
            battle_grid.push_creature({creature, position: destination[destination.length - 1]})
            break
        }
        default:
            throw Error(`forced movement type '${instruction.movement_type}' not supported`)
    }
}