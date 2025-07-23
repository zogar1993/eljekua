import {ConsequencePush} from "tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretConsequenceProps
} from "battlegrid/player_turn_handler/consequence_interpreters/InterpretConsequenceProps";

export const interpret_push = ({
                                   consequence,
                                   context,
                                   player_turn_handler,
                                   battle_grid
                               }: InterpretConsequenceProps<ConsequencePush>) => {
    const attacker = context.get_creature("owner")
    const defender = context.get_creature(consequence.target)

    //TODO contemplate push length
    const alternatives = battle_grid.get_push_positions({
        attacker_origin: attacker.data.position,
        defender_origin: defender.data.position,
        amount: 1
    })

    if (alternatives.length > 0) {
        player_turn_handler.set_awaiting_position_selection({
            available_targets: alternatives,
            on_click: (position) => {
                player_turn_handler.deselect()
                battle_grid.place_creature({creature: defender, position})
            }
        })
    }
}