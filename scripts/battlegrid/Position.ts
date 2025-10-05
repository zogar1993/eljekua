export type Position = { x: number, y: number, footprint: number }

export type OnPositionEvent = (params: { position: Position }) => void

export const assert_positions_have_same_footprint = (a: Position, b: Position) => {
    if (a.footprint !== b.footprint)
        throw Error(`expected positions to have the same footprint: '${JSON.stringify(a)}' - '${JSON.stringify(b)}'`)
}
export const positions_equal = (a: Position, b: Position) => {
    assert_positions_have_same_footprint(a, b)
    return a.x === b.x && a.y === b.y
}
