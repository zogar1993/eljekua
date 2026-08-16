import {
    InterpretInstructionProps
} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {EXPR} from "core/expressions/evaluator/EXPR";
import {InstructionOptions} from "core/virtual_machine/instructions/instructions";

export const interpret_options = ({
                                      instruction,
                                      player_turn_handler,
                                      evaluate_ast,
                                      turn_state
                                  }: InterpretInstructionProps<InstructionOptions>) => {
    player_turn_handler.set_available_interactions({
        type: "option_select",
        available_options: instruction.options.map(({text, condition, instructions}) => ({
                text,
                on_click: () => turn_state.add_instructions(instructions),
                disabled: condition ? !EXPR.as_boolean(evaluate_ast(condition)) : false
            })
        )
    })
}