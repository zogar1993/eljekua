import {InstructionMovement} from "expressions/tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";

export const interpret_shift = ({instruction, context, battle_grid}: InterpretInstructionProps<InstructionMovement>) => {
    const creature = context.get_creature(instruction.target)
    const path = context.get_path(instruction.destination)
    for (const position of path)
        battle_grid.move_creature_one_square({creature, position})
}