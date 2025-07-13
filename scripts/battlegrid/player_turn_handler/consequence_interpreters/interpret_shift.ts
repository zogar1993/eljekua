import {ConsequenceMovement} from "tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretConsequenceProps
} from "battlegrid/player_turn_handler/consequence_interpreters/InterpretConsequenceProps";

export const interpret_shift = ({consequence, context, battle_grid}: InterpretConsequenceProps<ConsequenceMovement>) => {
    const creature = context.get_creature(consequence.target)
    const path = context.get_path(consequence.destination)
    for (const position of path)
        battle_grid.move_creature_one_square({creature, position})
}