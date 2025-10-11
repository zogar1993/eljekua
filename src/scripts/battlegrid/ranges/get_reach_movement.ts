import {Position, positions_equal} from "scripts/battlegrid/Position";
import type {BattleGrid} from "scripts/battlegrid/BattleGrid";
import {get_reach_adjacent} from "scripts/battlegrid/ranges/get_reach_adjacent";
import {NODE} from "scripts/expressions/token_evaluator/NODE";
import type {InstructionSelectTarget} from "scripts/expressions/tokenizer/transform_power_ir_into_vm_representation";
import type {AstNode} from "scripts/expressions/token_evaluator/types";
import type {Token} from "scripts/expressions/tokenizer/tokens/AnyToken";


export const get_reach_movement = ({instruction, evaluate_token, battle_grid}: {
    instruction: InstructionSelectTarget,
    evaluate_token: (position: Token) => AstNode
    battle_grid: BattleGrid
}): Array<Position> => {
    if (instruction.targeting_type !== "movement") throw Error()
    const distance = NODE.as_number_resolved(evaluate_token(instruction.distance)).value
    const creature = NODE.as_creature(evaluate_token(instruction.creature)).value
    const visited: Array<Position> = [creature.data.position]
    let last_ring: Array<Position> = [creature.data.position]

    let movement_left = distance

    while (movement_left > 0) {
        const new_ring: Array<Position> = []

        for (const anchor of last_ring) {
            const new_ring_candidates = get_reach_adjacent({position: anchor, battle_grid})

            for (const new_ring_candidate of new_ring_candidates) {
                if (battle_grid.is_terrain_occupied(new_ring_candidate, {exclude: [creature]})) continue
                if (visited.some(position => positions_equal(position, new_ring_candidate))) continue
                if (new_ring.some(position => positions_equal(position, new_ring_candidate))) continue
                new_ring.push(new_ring_candidate)
                visited.push(new_ring_candidate)
            }
        }

        last_ring = new_ring

        movement_left--
    }

    return visited
}