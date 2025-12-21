import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {InstructionMovement} from "scripts/expressions/parser/instructions";

export const interpret_shift = ({
                                    instruction,
                                    turn_state,
                                    battle_grid
                                }: InterpretInstructionProps<InstructionMovement>) => {
    const creature = EXPR.as_creature(turn_state.get_variable(instruction.target))
    const path = EXPR.as_positions(turn_state.get_variable(instruction.destination))
    for (const position of path)
        battle_grid.move_creature_one_square({creature, position})
}