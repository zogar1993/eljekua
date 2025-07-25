import {AstNodeNumberResolved, NODE, resolve_number, token_to_node} from "expression_parsers/token_to_node";
import {ConsequenceApplyDamage} from "tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretConsequenceProps
} from "battlegrid/player_turn_handler/consequence_interpreters/InterpretConsequenceProps";

export const interpret_apply_damage = ({
                                           consequence,
                                           context,
                                           action_log,
                                           player_turn_handler
                                       }: InterpretConsequenceProps<ConsequenceApplyDamage>) => {
    const target = context.get_creature(consequence.target)

    const damage = NODE.as_number(token_to_node({token: consequence.value, context, player_turn_handler}))

    const resolved = resolve_number(damage)

    const result = resolved.value

    const modified_result: AstNodeNumberResolved = consequence.half_damage ? {
        type: "number_resolved",
        value: Math.floor(result / 2),
        params: [resolved],
        description: "half damage"
    } : resolved

    target.receive_damage(modified_result.value)
    action_log.add_new_action_log(`${target.data.name} was dealt `, modified_result, `${consequence.half_damage ? " half" : ""} damage.`)
}