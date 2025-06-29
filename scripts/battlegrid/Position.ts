export type Position = { x: number, y: number }

export type OnPositionClick = (params: { position: Position }) => void

export const positions_equal = (a: Position, b: Position) => a.x === b.x && a.y === b.y
