import {Position, positions_of_same_footprint_equal} from "scripts/battlegrid/Position";
import {get_reach_adjacent} from "scripts/battlegrid/position/get_reach_adjacent";
import type {BattleGrid} from "scripts/battlegrid/BattleGrid";
import {distance_between_positions} from "scripts/battlegrid/BattleGrid";

export const get_reach_push = ({anchor, origin, distance, battle_grid}: {
        anchor: Position,
        origin: Position,
        distance: number,
        battle_grid: BattleGrid
    }) => {
        const visited: Array<Position> = [origin]
        let next_ring: Array<Position> = [origin]
        const result: Array<Position> = []

        for (let i = 0; i < distance; i++) {
            const evaluating = next_ring
            for (const position of evaluating) {
                const distance = distance_between_positions(position, anchor)
                const adjacent = get_reach_adjacent({position, battle_grid}).filter(x => !battle_grid.is_terrain_occupied(x))
                const exclude_visited = adjacent.filter(a => visited.every(v => !positions_of_same_footprint_equal(a, v)))
                next_ring = exclude_visited.filter(x => distance_between_positions(x, anchor) > distance)
                result.push(...next_ring)
            }
        }

        return result
    }