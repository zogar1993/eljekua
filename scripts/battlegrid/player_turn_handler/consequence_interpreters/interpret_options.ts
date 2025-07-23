import {ConsequenceOptions} from "tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretConsequenceProps
} from "battlegrid/player_turn_handler/consequence_interpreters/InterpretConsequenceProps";

export const interpret_options = ({context, consequence, player_turn_handler}: InterpretConsequenceProps<ConsequenceOptions>) => {
    player_turn_handler.set_awaiting_option_selection({
        available_options: consequence.options.map(option => ({
                text: option.text,
                on_click: () => {
                    player_turn_handler.deselect()
                    context.add_consequences(option.consequences)
                }
            })
        )
    })
}