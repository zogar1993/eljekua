export type SquareHighlight = typeof SQUARE_HIGHLIGHT[keyof typeof SQUARE_HIGHLIGHT]

export const SQUARE_HIGHLIGHT = {
    SELECTED: "selected",
    AVAILABLE_TARGET: "available-target",
    PATH: "path",
    AREA: "area",
    NONE: "none"
} as const