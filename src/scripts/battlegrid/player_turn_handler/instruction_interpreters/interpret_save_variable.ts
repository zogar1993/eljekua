import {InstructionSaveVariable} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";

export const interpret_save_variable = ({
                                            instruction,
                                            turn_state,
                                            evaluate_ast
                                        }: InterpretInstructionProps<InstructionSaveVariable>) => {
    const expression = evaluate_ast(instruction.value)
    turn_state.set_variable(instruction.label, expression)
}
