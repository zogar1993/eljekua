import {InstructionOptions} from "scripts/expressions/tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {NODE} from "scripts/expressions/token_evaluator/NODE";

export const interpret_options = ({
                                      context,
                                      instruction,
                                      player_turn_handler,
                                      evaluate_token
                                  }: InterpretInstructionProps<InstructionOptions>) => {
    player_turn_handler.set_awaiting_option_selection({
        available_options: instruction.options.map(({text, condition, instructions}) => ({
                text: text,
                on_click: () => {
                    context.add_instructions(instructions)
                },
                disabled: condition ? !NODE.as_boolean(evaluate_token(condition)).value : false
            })
        )
    })
}