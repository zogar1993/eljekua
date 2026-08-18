import {
    InterpretInstructionProps
} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {InstructionOptions} from "core/virtual_machine/instructions/instructions";

export const interpret_options = ({
                                      instruction,
                                      player_turn_handler,
                                      evaluate_ast,
                                      game_state
                                  }: InterpretInstructionProps<InstructionOptions>) => {
    const {turn_state} = game_state
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