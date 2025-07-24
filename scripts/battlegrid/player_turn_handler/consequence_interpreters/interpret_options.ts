import {ConsequenceOptions} from "tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretConsequenceProps
} from "battlegrid/player_turn_handler/consequence_interpreters/InterpretConsequenceProps";
import {NODE, token_to_node} from "expression_parsers/token_to_node";

export const interpret_options = ({
                                      context,
                                      consequence,
                                      player_turn_handler
                                  }: InterpretConsequenceProps<ConsequenceOptions>) => {
    player_turn_handler.set_awaiting_option_selection({
        available_options: consequence.options.map(({text, condition, consequences}) => ({
                text: text,
                on_click: () => {
                    context.add_consequences(consequences)
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