import {ConsequenceOptions} from "tokenizer/transform_power_ir_into_vm_representation";
import {PowerContext} from "battlegrid/player_turn_handler/PowerContext";
import {PlayerTurnHandler} from "battlegrid/player_turn_handler/PlayerTurnHandler";

export const interpret_options = ({context, consequence, player_turn_handler}: {
    consequence: ConsequenceOptions,
    context: PowerContext,
    player_turn_handler: PlayerTurnHandler
}) => {
    player_turn_handler.set_awaiting_option_selection({
        currently_selected: context.get_creature("owner"),
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