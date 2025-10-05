export const SIZE: Record<Size, number> = {
    "tiny": 1,
    "small": 1,
    "medium": 1,
    "large": 2,
    "huge": 3,
    "gargantuan": 4,
} as const

export type Size = "tiny" | "small" | "medium" | "large" | "huge" | "gargantuan"
