import {NODE, token_to_node} from "expression_parsers/token_to_node";
import {ConsequenceCondition} from "tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretConsequenceProps
} from "battlegrid/player_turn_handler/consequence_interpreters/InterpretConsequenceProps";

export const interpret_condition = ({consequence, context, player_turn_handler}: InterpretConsequenceProps<ConsequenceCondition>) => {
    const condition = NODE.as_boolean(token_to_node({token: consequence.condition, context, player_turn_handler}))
    context.add_consequences(condition.value ? consequence.consequences_true : consequence.consequences_false)
}