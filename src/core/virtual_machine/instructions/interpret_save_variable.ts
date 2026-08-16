import {
    InterpretInstructionProps
} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {InstructionSaveVariable} from "core/virtual_machine/instructions/instructions";

export const interpret_save_variable = ({
                                            instruction,
                                            turn_state,
                                            evaluate_ast
                                        }: InterpretInstructionProps<InstructionSaveVariable>) => {
    const expression = evaluate_ast(instruction.value)
    turn_state.set_variable(instruction.label, expression)
}
