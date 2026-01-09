import {distance_between_positions, Position, positions_of_same_footprint_equal} from "scripts/battlegrid/Position";
import {get_reach_adjacent} from "scripts/battlegrid/position/get_reach_adjacent";
import type {BattleGrid} from "scripts/battlegrid/BattleGrid";
import {Creature} from "scripts/battlegrid/creatures/Creature";

export const get_reach_push = ({anchor, defender, distance, battle_grid}: {
    anchor: Position,
    defender: Creature,
    distance: number,
    battle_grid: BattleGrid
}) => {
    const origin = defender.data.position
    const visited: Array<Position> = [origin]
    let next_ring: Array<Position> = [origin]
    const result: Array<Position> = []

    for (let i = 0; i < distance; i++) {
        const evaluating = next_ring
        for (const position of evaluating) {
            const distance = distance_between_positions(position, anchor)
            console.log(position, distance)
            const adjacent = get_reach_adjacent({origin: position, battle_grid})
            const exclude_occupied = adjacent.filter(x => !battle_grid.is_terrain_occupied(x, {exclude: [defender]}))
            const exclude_visited = exclude_occupied.filter(a => visited.every(v => !positions_of_same_footprint_equal(a, v)))
            next_ring = exclude_visited.filter(x => distance_between_positions(x, anchor) > distance)
            result.push(...next_ring)
        }
    }

    return result
}