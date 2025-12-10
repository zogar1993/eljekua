import {Position, positions_of_same_footprint_equal} from "scripts/battlegrid/Position";
import type {BattleGrid} from "scripts/battlegrid/BattleGrid";
import {get_reach_adjacent} from "scripts/battlegrid/position/get_reach_adjacent";
import {Creature} from "scripts/battlegrid/creatures/Creature";

export const get_reach_movement = ({creature, distance, battle_grid}: {
    creature: Creature,
    distance: number
    battle_grid: BattleGrid
}): Array<Position> => {
    const visited: Array<Position> = [creature.data.position]
    let last_ring: Array<Position> = [creature.data.position]

    let movement_left = distance

    while (movement_left > 0) {
        const new_ring: Array<Position> = []

        for (const anchor of last_ring) {
            const new_ring_candidates = get_reach_adjacent({origin: anchor, battle_grid})

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