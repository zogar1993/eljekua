import {ConsequencePush} from "tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretConsequenceProps
} from "battlegrid/player_turn_handler/consequence_interpreters/InterpretConsequenceProps";
import {NODE, token_to_node} from "expression_parsers/token_to_node";

export const interpret_push = ({
                                   consequence,
                                   context,
                                   player_turn_handler,
                                   battle_grid
                               }: InterpretConsequenceProps<ConsequencePush>) => {
    const attacker = context.owner()
    const defender = context.get_creature(consequence.target)

    const alternatives = battle_grid.get_push_positions({
        attacker_origin: attacker.data.position,
        defender_origin: defender.data.position,
        amount: NODE.as_number_resolved(token_to_node({token: consequence.amount, context, player_turn_handler})).value
    })

    if (alternatives.length > 0) {
        player_turn_handler.set_awaiting_position_selection({
            available_targets: alternatives,
            on_click: (position) => {
                battle_grid.push_creature({creature: defender, position})
            }
        })
    }
}