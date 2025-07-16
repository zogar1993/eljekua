import {ConsequenceCopyVariable} from "tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretConsequenceProps
} from "battlegrid/player_turn_handler/consequence_interpreters/InterpretConsequenceProps";

export const interpret_copy_variable = ({consequence, context}: InterpretConsequenceProps<ConsequenceCopyVariable>) => {
    const variable = context.get_variable(consequence.origin)
    context.set_variable({type: variable.type, name: consequence.destination, value: variable.value} as Parameters<typeof context.set_variable>[0])
}