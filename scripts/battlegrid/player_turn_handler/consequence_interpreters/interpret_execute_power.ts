import {ConsequenceExecutePower, PowerVM} from "tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretConsequenceProps
} from "battlegrid/player_turn_handler/consequence_interpreters/InterpretConsequenceProps";
import {PowerContext} from "battlegrid/player_turn_handler/PowerContext";

export const interpret_execute_power = ({
                                            consequence,
                                            context,
                                            turn_context
                                        }: InterpretConsequenceProps<ConsequenceExecutePower>) => {
    const {name, consequences} = context.get_power(consequence.power)
    turn_context.add_power_context({name, consequences, owner: context.owner()})
}