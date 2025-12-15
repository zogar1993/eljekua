import {InstructionExecutePower} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {EXPR} from "scripts/expressions/evaluator/EXPR";

export const interpret_execute_power = ({
                                            instruction,
                                            turn_state
                                        }: InterpretInstructionProps<InstructionExecutePower>) => {
    const owner = turn_state.get_power_owner()
    const {name, instructions} = EXPR.as_power(turn_state.get_variable(instruction.power))
    turn_state.add_power_frame({name, instructions, owner})
}