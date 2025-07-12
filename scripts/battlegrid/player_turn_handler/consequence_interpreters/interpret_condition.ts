import {NODE, token_to_node} from "expression_parsers/token_to_node";
import {ConsequenceCondition} from "tokenizer/transform_power_ir_into_vm_representation";
import {PowerContext} from "battlegrid/player_turn_handler/PowerContext";

export const interpret_condition = ({consequence, context}: { consequence: ConsequenceCondition, context: PowerContext }) => {
    const condition = NODE.as_boolean(token_to_node({token: consequence.condition, context}))
    context.add_consequences(condition.value ? consequence.consequences_true : consequence.consequences_false)
}