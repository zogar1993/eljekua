import {Position, positions_equal} from "battlegrid/Position";
import {get_adjacent} from "battlegrid/ranges/get_adyacent";
import type {BattleGrid} from "battlegrid/BattleGrid";
import {distance_between_positions} from "battlegrid/BattleGrid";

export const get_push_positions = ({anchor, origin, distance, battle_grid}: {
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
                const adjacent = get_adjacent({position, battle_grid}).filter(x => !battle_grid.is_terrain_occupied(x))
                const exclude_visited = adjacent.filter(a => visited.every(v => !positions_equal(a, v)))
                next_ring = exclude_visited.filter(x => distance_between_positions(x, anchor) > distance)
                result.push(...next_ring)
            }
        }

        return result
    }