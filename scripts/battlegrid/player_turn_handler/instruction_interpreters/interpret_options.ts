import {InstructionOptions} from "tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {NODE, token_to_node} from "expression_parsers/token_to_node";

export const interpret_options = ({
                                      context,
                                      instruction,
                                      player_turn_handler
                                  }: InterpretInstructionProps<InstructionOptions>) => {
    player_turn_handler.set_awaiting_option_selection({
        available_options: instruction.options.map(({text, condition, instructions}) => ({
                text: text,
                on_click: () => {
                    context.add_instructions(instructions)
                },
                disabled: condition ? !NODE.as_boolean(token_to_node({
                    token: condition,
                    context,
                    player_turn_handler
                })).value : false
            })
        )
    })
}