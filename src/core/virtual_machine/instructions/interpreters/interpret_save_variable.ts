import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import type {InstructionSaveVariable} from "core/virtual_machine/instructions/instructions";

export const interpret_save_variable = ({
                                            instruction,
                                            game_state,
                                            game_queries
                                        }: InterpretInstructionProps<InstructionSaveVariable>) => {
    const {vm_state} = game_state
    const expression = game_queries.evaluate(instruction.value)
    vm_state.set_variable(instruction.label, expression)
}
