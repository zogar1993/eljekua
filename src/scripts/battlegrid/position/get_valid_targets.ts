import {InstructionSelectTarget} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";
import {PowerContext} from "scripts/battlegrid/player_turn_handler/PowerContext";
import {BattleGrid} from "scripts/battlegrid/BattleGrid";
import {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import {Expr} from "scripts/expressions/evaluator/types";
import {get_reach} from "scripts/battlegrid/position/get_reach";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {Position, positions_of_same_footprint_equal, positions_share_surface} from "scripts/battlegrid/Position";

export const get_valid_targets = ({instruction, context, battle_grid, evaluate_ast}: {
    instruction: InstructionSelectTarget,
    context: PowerContext,
    battle_grid: BattleGrid,
    evaluate_ast: (node: AstNode) => Expr
}) => {
    const in_range = get_reach({instruction, battle_grid, evaluate_ast})

    if (instruction.targeting_type === "area_burst")
        return in_range

    if (instruction.targeting_type === "push")
        return in_range

    if (instruction.targeting_type === "movement") {
        const valid_targets = in_range.filter(position => !battle_grid.is_terrain_occupied(position))
        if (instruction.destination_requirement) {
            const possibilities = EXPR.as_positions(evaluate_ast(instruction.destination_requirement))

            const restricted: Array<Position> = []
            for (const position of valid_targets)
                for (const possibility of possibilities)
                    if (positions_share_surface(position, possibility))
                        restricted.push(position)
            return restricted
        } else
            return valid_targets
    }

    const valid_targets = in_range.filter(position => {
        if (instruction.target_type === "terrain")
            return !battle_grid.is_terrain_occupied(position)
        if (instruction.target_type === "enemy")
            return battle_grid.is_terrain_occupied(position)
        if (instruction.target_type === "creature")
            return battle_grid.is_terrain_occupied(position)

        throw `Target "${instruction.target_type}" not supported`
    })

    return valid_targets.filter(
        target => !instruction.exclude.some(
            //TODO AP3 this one feels fishy
            excluded => positions_of_same_footprint_equal(EXPR.as_creature(context.get_variable(excluded)).data.position, target)
        )
    )
}