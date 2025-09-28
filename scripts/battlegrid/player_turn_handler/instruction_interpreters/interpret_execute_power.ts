import {InstructionExecutePower} from "expressions/tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {NODE} from "expressions/token_evaluator/NODE";

export const interpret_execute_power = ({
                                            instruction,
                                            context,
                                            turn_context
                                        }: InterpretInstructionProps<InstructionExecutePower>) => {
    const {name, instructions} = NODE.as_power(context.get_variable(instruction.power)).value
    turn_context.add_power_context({name, instructions, owner: context.owner()})
}