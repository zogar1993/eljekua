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

export function assert_is_footprint_one(p: Position): asserts p is PositionFootprintOne {
    if (!position_is_footprint_one(p))
        throw Error(`Expected position to be f1: ${JSON.stringify(p)}`)
}

export function assert_are_footprint_one(positions: Array<Position>): asserts positions is Array<PositionFootprintOne> {
    if (positions.every(position => position_is_footprint_one(position))) return
    throw Error(`Expected positions to be f1: ${JSON.stringify(positions)}`)
}

const position_is_footprint_one = (position: Position): position is PositionFootprintOne =>
    position.footprint === 1

export const positions_equal_footprint_one = (a: PositionFootprintOne, b: PositionFootprintOne) =>
    a.x === b.x && a.y === b.y

export const positions_share_surface = (a: Position, b: Position) => {
    if (position_is_footprint_one(a) && position_is_footprint_one(b))
        return positions_equal_footprint_one(a, b)

    return surfaces_overlap(position_to_surface(a), position_to_surface(b))
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

export const distance_between_positions = (a: Position, b: Position) => {
    if (position_is_footprint_one(a) && position_is_footprint_one(b))
        return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))

    const aa = position_to_surface(a)
    const bb = position_to_surface(b)

    if (surfaces_overlap(aa, bb))
        return 0

    const x_distance = Math.min(Math.abs(aa.min_x - bb.max_x), Math.abs(bb.min_x - aa.max_x))
    const y_distance = Math.min(Math.abs(aa.min_y - bb.max_y), Math.abs(bb.min_y - aa.max_y))
    return Math.max(x_distance, y_distance)
}

type Surface = {
    min_x: number
    max_x: number,
    min_y: number
    max_y: number
}

const position_to_surface = (p: Position): Surface => ({
    min_x: p.x,
    max_x: p.x + p.footprint - 1,
    min_y: p.y,
    max_y: p.y + p.footprint - 1,
})

const surfaces_overlap = (a: Surface, b: Surface) =>
    !(b.max_x < a.min_x || a.max_x < b.min_x) &&
    !(b.max_y < a.min_y || a.max_y < b.min_y)