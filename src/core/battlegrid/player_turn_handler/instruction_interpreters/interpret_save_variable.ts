import {
    InterpretInstructionProps
} from "core/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {InstructionSaveVariable} from "core/expressions/parser/instructions";

export const interpret_save_variable = ({
                                            instruction,
                                            turn_state,
                                            evaluate_ast
                                        }: InterpretInstructionProps<InstructionSaveVariable>) => {
    const expression = evaluate_ast(instruction.value)
    turn_state.set_variable(instruction.label, expression)
}
