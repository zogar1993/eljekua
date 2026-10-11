import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import type {InstructionSaveVariable} from "core/virtual_machine/instructions/instructions";

export const interpret_save_variable = ({
                                            instruction,
                                            game_state,
                                            game_queries
                                        }: InterpretInstructionProps<InstructionSaveVariable>) => {
    const {vm_state} = game_state
//TODO the distinctio between power and other variables is odd
    if ("power" in instruction)
        vm_state.set_variable(instruction.label, {type: "power", value: instruction.power})
    else
        vm_state.set_variable(instruction.label, game_queries.evaluate(instruction.value))
}
