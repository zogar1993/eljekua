import {InstructionForceMovement} from "scripts/expressions/tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {NODE} from "scripts/expressions/token_evaluator/NODE";

export const interpret_force_movement = ({
                                             instruction,
                                             battle_grid,
                                             evaluate_token
                                         }: InterpretInstructionProps<InstructionForceMovement>) => {
    const creature = NODE.as_creature(evaluate_token(instruction.target)).value
    switch (instruction.movement_type) {
        case "push": {
            const destination = NODE.as_position(evaluate_token(instruction.destination)).value
            battle_grid.push_creature({creature, position: destination})
            break
        }
        default:
            throw Error(`forced movement type '${instruction.movement_type}' not supported`)
    }
}