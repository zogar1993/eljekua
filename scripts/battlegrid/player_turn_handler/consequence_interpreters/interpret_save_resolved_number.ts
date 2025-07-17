import {ConsequenceSaveResolvedNumber} from "tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretConsequenceProps
} from "battlegrid/player_turn_handler/consequence_interpreters/InterpretConsequenceProps";
import {NODE, resolve_number, token_to_node} from "expression_parsers/token_to_node";

export const interpret_save_resolved_number = ({
                                                   consequence,
                                                   context
                                               }: InterpretConsequenceProps<ConsequenceSaveResolvedNumber>) => {
    const value = resolve_number(NODE.as_number(token_to_node({token: consequence.value, context})))
    context.set_resolved_number({name: consequence.label, value})
}