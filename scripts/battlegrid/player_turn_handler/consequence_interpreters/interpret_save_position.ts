import {ConsequenceSavePosition} from "tokenizer/transform_power_ir_into_vm_representation";
import {PowerContext} from "battlegrid/player_turn_handler/PowerContext";

export const interpret_save_position = ({consequence, context}: {
    consequence: ConsequenceSavePosition,
    context: PowerContext
}) => {
    const target = context.get_creature(consequence.target)
    context.set_variable({type: "position", name: consequence.label, value: target.data.position})
}