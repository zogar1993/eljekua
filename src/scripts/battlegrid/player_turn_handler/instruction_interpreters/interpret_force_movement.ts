import {InstructionForceMovement} from "scripts/expressions/tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {EXPR} from "scripts/expressions/token_evaluator/EXPR";

export const interpret_force_movement = ({
                                             instruction,
                                             battle_grid,
                                             evaluate_token
                                         }: InterpretInstructionProps<InstructionForceMovement>) => {
    const creature = EXPR.as_creature(evaluate_token(instruction.target))
    switch (instruction.movement_type) {
        case "push": {
            const destination = EXPR.as_position(evaluate_token(instruction.destination))
            battle_grid.push_creature({creature, position: destination})
            break
        }
        default:
            throw Error(`forced movement type '${instruction.movement_type}' not supported`)
    }
}