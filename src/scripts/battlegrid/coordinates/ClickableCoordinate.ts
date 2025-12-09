import {Position, positions_equal} from "scripts/battlegrid/Position";

export type ClickableCoordinate = { x: number, y: number }

export const coordinates_equal = (a: ClickableCoordinate, b: ClickableCoordinate) => a.x === b.x && a.y === b.y

export const get_position_by_coordinate = ({coordinate, positions}: {
    coordinate: ClickableCoordinate,
    positions: Array<Position>
}): Position | null => {
    const possible_positions = positions.filter(position => is_coordinate_in_position({coordinate, position}))

    if (possible_positions.length === 0) return null;

    let position: Position = positions[0]
    let likelihood: number = calculate_likelihood({coordinate, position})
    for (let i = 1; i < positions.length; i++) {
        const challenger = positions[i]
        const challenger_likelihood = calculate_likelihood({coordinate, position: challenger})
        if (challenger_likelihood > likelihood) {
            position = challenger
            likelihood = challenger_likelihood
        }
    }
    return position
}

const calculate_likelihood = ({coordinate, position}: {
    coordinate: ClickableCoordinate,
    position: Position
}) => {
    const {min_x, max_x, min_y, max_y} = position_to_coordinate_boundaries(position)
    const likelihood_x = Math.min(coordinate.x - min_x, max_x - coordinate.x)
    const likelihood_y = Math.min(coordinate.y - min_y, max_y - coordinate.y)
    return likelihood_x + likelihood_y
}

const is_coordinate_in_position = ({coordinate, position}: {
    coordinate: ClickableCoordinate,
    position: Position
}) => {
    const {min_x, max_x, min_y, max_y} = position_to_coordinate_boundaries(position)
    return min_x <= coordinate.x && coordinate.x <= max_x && min_y <= coordinate.y && coordinate.y <= max_y
}

const position_to_coordinate_boundaries = (position: Position) => {
    const min_x = position.x * 2
    const max_x = (position.x + position.footprint) * 2 - 1
    const min_y = position.y * 2
    const max_y = (position.y + position.footprint) * 2 - 1
    return {min_x, max_x, min_y, max_y}
}

export const nullable_positions_equal = (p1: Position | null, p2: Position | null) =>
    p1 === null && p2 === null ? true :
        p1 === null || p2 === null ? false :
            positions_equal(p1, p2)