import {InstructionExecutePower, PowerVM} from "tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {PowerContext} from "battlegrid/player_turn_handler/PowerContext";

export const interpret_execute_power = ({
                                            instruction,
                                            context,
                                            turn_context
                                        }: InterpretInstructionProps<InstructionExecutePower>) => {
    const {name, instructions} = context.get_power(instruction.power)
    turn_context.add_power_context({name, instructions, owner: context.owner()})
}