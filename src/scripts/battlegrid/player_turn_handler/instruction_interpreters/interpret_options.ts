import {InstructionOptions} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {EXPR} from "scripts/expressions/evaluator/EXPR";

export const interpret_options = ({
                                      instruction,
                                      player_turn_handler,
                                      evaluate_ast,
                                      turn_state
                                  }: InterpretInstructionProps<InstructionOptions>) => {
    player_turn_handler.set_awaiting_option_selection({
        available_options: instruction.options.map(({text, condition, instructions}) => ({
                text: text,
                on_click: () => {
                    turn_state.add_instructions(instructions)
                },
                disabled: condition ? !EXPR.as_boolean(evaluate_ast(condition)) : false
            })
        )
    })
}