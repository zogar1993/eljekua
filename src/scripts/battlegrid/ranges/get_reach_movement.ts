import {Position, positions_of_same_footprint_equal} from "scripts/battlegrid/Position";
import type {BattleGrid} from "scripts/battlegrid/BattleGrid";
import {get_reach_adjacent} from "scripts/battlegrid/ranges/get_reach_adjacent";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import type {InstructionSelectTarget} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";
import type {Expr} from "scripts/expressions/evaluator/types";
import type {AstNode} from "scripts/expressions/parser/nodes/AstNode";


export const get_reach_movement = ({instruction, evaluate_ast, battle_grid}: {
    instruction: InstructionSelectTarget,
    evaluate_ast: (node: AstNode) => Expr
    battle_grid: BattleGrid
}): Array<Position> => {
    if (instruction.targeting_type !== "movement") throw Error()
    const distance = EXPR.as_number_resolved(evaluate_ast(instruction.distance)).value
    const creature = EXPR.as_creature(evaluate_ast(instruction.creature))
    const visited: Array<Position> = [creature.data.position]
    let last_ring: Array<Position> = [creature.data.position]

    let movement_left = distance

    while (movement_left > 0) {
        const new_ring: Array<Position> = []

        for (const anchor of last_ring) {
            const new_ring_candidates = get_reach_adjacent({position: anchor, battle_grid})

            for (const new_ring_candidate of new_ring_candidates) {
                if (battle_grid.is_terrain_occupied(new_ring_candidate, {exclude: [creature]})) continue
                if (visited.some(position => positions_of_same_footprint_equal(position, new_ring_candidate))) continue
                if (new_ring.some(position => positions_of_same_footprint_equal(position, new_ring_candidate))) continue
                new_ring.push(new_ring_candidate)
                visited.push(new_ring_candidate)
            }
        }

        last_ring = new_ring

        movement_left--
    }

    return visited
}