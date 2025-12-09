export type Position = { x: number, y: number, footprint: number }
export type PositionFootprintOne = { x: number, y: number, footprint: 1 }

export const assert_positions_have_same_footprint = (a: Position, b: Position) => {
    if (a.footprint !== b.footprint)
        throw Error(`expected positions to have the same footprint: '${JSON.stringify(a)}' - '${JSON.stringify(b)}'`)
}

export const positions_equal = (a: Position, b: Position) =>
    a.x === b.x && a.y === b.y && a.footprint === b.footprint

export const positions_of_same_footprint_equal = (a: Position, b: Position) => {
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
    const a_max_y = a.y + a.footprint - 1
    const a_max_x = a.x + a.footprint - 1
    const b_min_y = b.y
    const b_min_x = b.x
    const b_max_y = b.y + b.footprint - 1
    const b_max_x = b.x + b.footprint - 1

    return (
        !(b_max_x < a_min_x || a_max_x < b_min_x) &&
        !(b_max_y < a_min_y || a_max_y < b_min_y)
    )
}

export const transform_position_to_f1 = (position: Position): Array<PositionFootprintOne> => {
    if (position.footprint === 1) return [position as PositionFootprintOne]
    const positions: Array<PositionFootprintOne> = []
    for (let x = position.x; x < position.x + position.footprint; x++)
        for (let y = position.y; y < position.y + position.footprint; y++)
            positions.push({x, y, footprint: 1})
    return positions
}

export const transform_positions_to_f1 = (positions: Array<Position>): Array<PositionFootprintOne> => {
    const map: Map<string, PositionFootprintOne> = new Map()
    for (const position of positions)
        for (const p of transform_position_to_f1(position))
            map.set(`x${p.x}y${p.y}`, p)
    return [...map.values()]
}
