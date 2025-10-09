export type Position = { x: number, y: number, footprint: number }
export type PositionFootprintOne = { x: number, y: number, footprint: 1 }

export type OnPositionEvent = (params: { position: Position }) => void

export const assert_positions_have_same_footprint = (a: Position, b: Position) => {
    if (a.footprint !== b.footprint)
        throw Error(`expected positions to have the same footprint: '${JSON.stringify(a)}' - '${JSON.stringify(b)}'`)
}

export const positions_equal = (a: Position, b: Position) => {
    assert_positions_have_same_footprint(a, b)
    return a.x === b.x && a.y === b.y
}

export const position_is_footprint_one = (position: Position): position is PositionFootprintOne =>
    position.footprint === 1

export const positions_equal_footprint_one = (a: PositionFootprintOne, b: PositionFootprintOne) =>
    a.x === b.x && a.y === b.y

export const positions_share_surface = (a: Position, b: Position) => {
    if (position_is_footprint_one(a) && position_is_footprint_one(b))
        return positions_equal_footprint_one(a, b)

    const a_min_y = a.y
    const a_min_x = a.x
    const b_min_y = b.y
    const b_min_x = b.x
    const a_max_y = a.y + a.footprint - 1
    const a_max_x = a.x + a.footprint - 1
    const b_max_y = b.y + b.footprint - 1
    const b_max_x = b.x + b.footprint - 1

    const share_x =
        (a_min_x <= b_min_x && b_min_x <= a_max_x) ||
        (a_min_x <= b_max_x && b_max_x <= a_max_x) ||
        // If 'b' boundaries aren't contained in 'a',
        // then we only need to check that 'a' as a whole isn't contained in 'b',
        // for example a 1x1 position at the center of a 3x3 position.
        // This means we only need to check one of 'a' boundaries is contained in 'b',
        // we don't need to check the other.
        (b_min_x <= a_min_x && a_min_x <= b_max_x)

    // We can short circuit if they don't share an axis
    if (!share_x) return false

    return (
        (a_min_y <= b_min_y && b_min_y <= a_max_y) ||
        (a_min_y <= b_max_y && b_max_y <= a_max_y) ||
        // 'y' boundaries follow the same reasoning as 'x' boundaries
        (b_min_y <= a_min_y && a_min_y <= b_max_y)
    )
}
