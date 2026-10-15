export const STRUCTURE_KIND = {
    WALL: "wall",
    COVER: "cover",
} as const

export type StructureKind = typeof STRUCTURE_KIND[keyof typeof STRUCTURE_KIND]

export type Structure = {
    kind: StructureKind
    blocks_movement: boolean
    blocks_line_of_sight: boolean
    blocks_line_of_effect: boolean
}

export const OPAQUE_SOLID_WALL: Structure = {
    kind: STRUCTURE_KIND.WALL,
    blocks_movement: true,
    blocks_line_of_sight: true,
    blocks_line_of_effect: true,
}

export const OPAQUE_TRANSVERSABLE_WALL: Structure = {
    kind: STRUCTURE_KIND.COVER,
    blocks_movement: false,
    blocks_line_of_sight: true,
    blocks_line_of_effect: true,
}
