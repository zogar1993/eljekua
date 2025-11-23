import {InstructionExecutePower} from "scripts/expressions/tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {EXPR} from "scripts/expressions/token_evaluator/EXPR";

export const interpret_execute_power = ({
                                            instruction,
                                            context,
                                            turn_context
                                        }: InterpretInstructionProps<InstructionExecutePower>) => {
    const {name, instructions} = EXPR.as_power(context.get_variable(instruction.power)).value
    turn_context.add_power_context({name, instructions, owner: context.owner()})
}