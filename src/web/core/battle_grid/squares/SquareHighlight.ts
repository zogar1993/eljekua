export type SquareHighlight = typeof SQUARE_HIGHLIGHT[keyof typeof SQUARE_HIGHLIGHT]

export const SQUARE_HIGHLIGHT = {
    SELECTED: "selected",
    CLICKABLE: "clickable",
    PATH: "path",
    AREA: "area",
} as const