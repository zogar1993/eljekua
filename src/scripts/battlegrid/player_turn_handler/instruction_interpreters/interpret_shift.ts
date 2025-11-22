import {InstructionMovement} from "scripts/expressions/tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {NODE} from "scripts/expressions/token_evaluator/NODE";

export const interpret_shift = ({instruction, context, battle_grid}: InterpretInstructionProps<InstructionMovement>) => {
    const creature = NODE.as_creature(context.get_variable(instruction.target))
    const path = NODE.as_positions(context.get_variable(instruction.destination))
    for (const position of path)
        battle_grid.move_creature_one_square({creature, position})
}