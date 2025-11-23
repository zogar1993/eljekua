import {InstructionMovement} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {EXPR} from "scripts/expressions/evaluator/EXPR";

export const interpret_shift = ({instruction, context, battle_grid}: InterpretInstructionProps<InstructionMovement>) => {
    const creature = EXPR.as_creature(context.get_variable(instruction.target))
    const path = EXPR.as_positions(context.get_variable(instruction.destination))
    for (const position of path)
        battle_grid.move_creature_one_square({creature, position})
}