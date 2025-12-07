import {InstructionExecutePower} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {EXPR} from "scripts/expressions/evaluator/EXPR";

export const interpret_execute_power = ({
                                            instruction,
                                            turn_context
                                        }: InterpretInstructionProps<InstructionExecutePower>) => {
    const context = turn_context.get_current_context()
    const {name, instructions} = EXPR.as_power(context.get_variable(instruction.power))
    turn_context.add_power_context({name, instructions, owner: context.owner()})
}