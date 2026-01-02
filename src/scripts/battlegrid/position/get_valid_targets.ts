import {BattleGrid} from "scripts/battlegrid/BattleGrid";
import {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import {Expr} from "scripts/expressions/evaluator/types";
import {get_reach} from "scripts/battlegrid/position/get_reach";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {
    assert_are_footprint_one,
    Position,
    PositionFootprintOne,
    positions_equal,
    positions_share_surface,
} from "scripts/battlegrid/Position";
import {AST} from "scripts/expressions/parser/AST_NODE";
import {InstructionSelectTarget} from "scripts/expressions/parser/instructions";

export const get_valid_targets = ({instruction, battle_grid, evaluate_ast}: {
    instruction: InstructionSelectTarget,
    battle_grid: BattleGrid,
    evaluate_ast: (node: AstNode) => Expr
}) => {
    const in_range = get_reach({instruction, battle_grid, evaluate_ast})

    if (instruction.targeting_type === "area_burst")
        return in_range

    if (instruction.targeting_type === "push")
        return in_range

    if (instruction.targeting_type === "movement") {
        const owner = EXPR.as_creature(evaluate_ast(AST.OWNER))
        const valid_targets = in_range
            .filter(position => !positions_equal(position, owner.data.position))
            .filter(position => !battle_grid.is_terrain_occupied(position, {exclude: [owner]}))

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

    let valid_targets: Array<Position>
    if (instruction.target_type === "terrain") {
        valid_targets = in_range.filter(position => !battle_grid.is_terrain_occupied(position))
    } else if (instruction.target_type === "enemy" || instruction.target_type === "creature") {
        assert_are_footprint_one(in_range)
        valid_targets = battle_grid.get_creatures_in_positions(in_range).map(c => c.data.position)
    } else {
        throw `Target "${instruction.target_type}" not supported`
    }

    const results: Array<Position> = []
    const excluded_positions = instruction.exclude.flatMap(node => EXPR.as_positions(evaluate_ast(node)))
    for (const position of valid_targets) {
        if (excluded_positions.some(excluded => positions_share_surface(excluded, position))) continue
        results.push(position)
    }

    return results
}