import {Creature} from "scripts/battlegrid/creatures/Creature";
import {get_flanker_positions} from "scripts/battlegrid/position/get_flanker_positions";
import {are_creatures_allied} from "scripts/creatures/are_creatures_allied";
import {BattleGrid, distance_between_positions} from "scripts/battlegrid/BattleGrid";
import {
    assert_positions_have_same_footprint,
    Position,
    positions_of_same_footprint_equal
} from "scripts/battlegrid/Position";
import {get_reach_adjacent} from "scripts/battlegrid/position/get_reach_adjacent";

export const create_get_shortest_path = (battle_grid: BattleGrid) =>
    ({creature, destination}: { creature: Creature, destination: Position }) => {
        const origin = creature.data.position
        const visited: Array<Position> = [origin]

        type WeightedPath = {
            path: Array<Position>,
            distance: { squares: number, intuitive: number },
            moved: number,
            weight: number
        }

        const initial_distance = distance_between_positions(origin, destination)
        let paths: Array<WeightedPath> =
            [{
                path: [origin],
                moved: 0,
                distance: {
                    squares: initial_distance,
                    intuitive: intuitive_distance_between_positions(origin, destination)
                },
                weight: initial_distance
            }]
        const extend_path = ({old_path, position}: { old_path: WeightedPath, position: Position }): WeightedPath => {
            const distance = distance_between_positions(position, destination)
            const moved = old_path.moved + 1
            return {
                path: [...old_path.path, position],
                distance: {squares: distance, intuitive: intuitive_distance_between_positions(position, destination)},
                moved,
                weight: distance + moved
            }
        }

        while (paths.length > 0) {
            const min_weight = Math.min(...paths.map(x => x.weight))
            const min_weight_paths = paths.filter(x => x.weight === min_weight)
            const min_intuitive_distance = Math.min(...min_weight_paths.map(x => x.distance.intuitive))
            const current_path = paths.find(x => x.distance.intuitive === min_intuitive_distance)!

            // remove the current path from the list, we only need its products, and we also avoid dead ends
            paths = paths.filter(x => x !== current_path)

            const head = current_path.path[current_path.path.length - 1]
            const alternatives = get_reach_adjacent({position: head, battle_grid})
                .filter(a => visited.every(b => !positions_of_same_footprint_equal(a, b)))
                .filter(a => !battle_grid.is_terrain_occupied(a, {exclude: [creature]}))

            const ending_position = alternatives.find(alternative => positions_of_same_footprint_equal(alternative, destination))
            if (ending_position) return [...current_path.path, ending_position]

            visited.push(...alternatives)

            paths = [
                ...alternatives.map(position => extend_path({old_path: current_path, position})),
                ...paths
            ]
        }

        throw Error(`Path not found from ${JSON.stringify(origin)} to ${JSON.stringify(destination)}`)
    }

const intuitive_distance_between_positions = (a: Position, b: Position) => {
    assert_positions_have_same_footprint(a, b)
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}