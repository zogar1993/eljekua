import {ConsequenceExecutePower, PowerVM} from "tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretConsequenceProps
} from "battlegrid/player_turn_handler/consequence_interpreters/InterpretConsequenceProps";
import {PowerContext} from "battlegrid/player_turn_handler/PowerContext";

export const interpret_execute_power = ({
                                            consequence,
                                            context,
                                            player_turn_handler
                                        }: InterpretConsequenceProps<ConsequenceExecutePower>) => {
    const power: PowerVM = context.get_power(consequence.power)

    //TODO create power context internally from the turn context
    const new_context = new PowerContext(power.consequences, power.name)
    new_context.set_creature({name: "owner", value: context.owner()})
    player_turn_handler.turn_context.add_power_context(new_context)
}