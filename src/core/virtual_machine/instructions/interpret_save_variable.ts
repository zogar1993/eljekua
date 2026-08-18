import {
    InterpretInstructionProps
} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {InstructionSaveVariable} from "core/virtual_machine/instructions/instructions";

export const interpret_save_variable = ({
                                            instruction,
                                            game_state,
                                            evaluate_ast
                                        }: InterpretInstructionProps<InstructionSaveVariable>) => {
    const {turn_state} = game_state
    const expression = evaluate_ast(instruction.value)
    turn_state.set_variable(instruction.label, expression)
}
