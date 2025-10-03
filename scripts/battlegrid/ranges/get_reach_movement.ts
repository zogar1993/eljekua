import {Position, positions_equal} from "battlegrid/Position";
import {BattleGrid} from "battlegrid/BattleGrid";
import {get_reach_adyacents} from "battlegrid/ranges/get_reach_adyacent";


export const get_reach_movement = ({origin, distance, battle_grid}: {
    origin: Position,
    distance: number,
    battle_grid: BattleGrid
}): Array<Position> => {
    const visited = [origin]
    let last_ring = [origin]

    let movement_left = distance

    while (movement_left > 0) {
        const new_ring: Array<Position> = []

        for (const anchor of last_ring) {
            const new_ring_candidates = get_reach_adyacents({position: anchor, battle_grid})

            for (const new_ring_candidate of new_ring_candidates) {
                if (battle_grid.is_terrain_occupied(new_ring_candidate)) continue
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