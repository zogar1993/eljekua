import {ConsequenceMovement} from "tokenizer/transform_power_ir_into_vm_representation";
import {PowerContext} from "battlegrid/player_turn_handler/PowerContext";
import {BattleGrid} from "battlegrid/BattleGrid";

export const interpret_shift = ({consequence, context, battle_grid}: {
    consequence: ConsequenceMovement,
    context: PowerContext,
    battle_grid: BattleGrid
}) => {
    const creature = context.get_creature(consequence.target)
    const path = context.get_path(consequence.destination)
    for (const position of path)
        battle_grid.move_creature_one_square({creature, position})
}