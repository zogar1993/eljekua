import {ConsequenceSavePosition} from "tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretConsequenceProps
} from "battlegrid/player_turn_handler/consequence_interpreters/InterpretConsequenceProps";

export const interpret_save_position = ({consequence, context}: InterpretConsequenceProps<ConsequenceSavePosition>) => {
    const target = context.get_creature(consequence.target)
    context.set_variable({type: "position", name: consequence.label, value: target.data.position})
}