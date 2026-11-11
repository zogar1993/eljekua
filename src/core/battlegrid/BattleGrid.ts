import type {Creature} from "core/battlegrid/creatures/Creature";
import type {Position, PositionFootprintOne} from "core/battlegrid/Position";
import {
    positions_equal_footprint_one,
    positions_share_surface,
    transform_position_to_f1
} from "core/battlegrid/Position";
import type {Creatures} from "core/creatures/Creatures";
import type {Structure} from "core/battlegrid/Structure";
import {assert_is_included, assert_is_not_undefined} from "stdlib/assert";

export const create_battle_grid = ({size, creatures}: {
    size: { x: number, y: number }
    creatures: Creatures
}) => {
    const board: Array<Array<BoardPosition>> = []
    for (let y = 0; y < size.y; y++) {
        const line: Array<BoardPosition> = []

        for (let x = 0; x < size.x; x++)
            line[x] = {structure: null}

        board[y] = line
    }

    const separators_x_axis: Array<Array<BoardPosition>> = []
    const separators_y_axis: Array<Array<BoardPosition>> = []

    for (let y = 0; y < size.y; y++) {
        const line: Array<BoardPosition> = []
        for (let x = 0; x < size.x - 1; x++)
            line[x] = {structure: null}
        separators_x_axis[y] = line
    }

    for (let y = 0; y < size.y - 1; y++) {
        const line: Array<BoardPosition> = []
        for (let x = 0; x < size.x; x++)
            line[x] = {structure: null}
        separators_y_axis[y] = line
    }

    const get_board = (): ReadonlyArray<ReadonlyArray<BoardPosition>> => board

    const get_square = ({x, y}: PositionFootprintOne) => {
        if (x < 0 || x >= size.x || y < 0 || y >= size.y)
            throw (`position {x:${x}, y:${y}} is out of the battle grid dimensions (width:${size.x}, height:${size.y})`)
        return board[y][x]
    }

    const get_squares = (position: Position) => {
        return transform_position_to_f1(position).map(p => get_square(p))
    }

    const get_separator_x_axis = ({x, y}: PositionBasic) => {
        if (x < 0 || x >= size.x - 1 || y < 0 || y >= size.y)
            throw (`x-axis separator {x:${x}, y:${y}} is out of bounds (width:${size.x}, height:${size.y})`)
        return separators_x_axis[y][x]
    }

    const get_separator_y_axis = ({x, y}: PositionBasic) => {
        if (x < 0 || x >= size.x || y < 0 || y >= size.y - 1)
            throw (`y-axis separator {x:${x}, y:${y}} is out of bounds (width:${size.x}, height:${size.y})`)
        return separators_y_axis[y][x]
    }

    const get_separator = ({position, axis}: { position: PositionBasic, axis: "x" | "y" }) => {
        if (axis === "x") return get_separator_x_axis(position)
        else return get_separator_y_axis(position)
    }

    const can_trace_line_towards = ({position, direction, axis, type}: {
        position: PositionBasic,
        direction: number,
        axis: "x" | "y",
        type: LineType
    }): boolean => {
        assert_is_included(direction, [-1, 1])
        const separator_position = direction === 1 ? position : {...position, [axis]: position[axis] + direction}
        const separator = get_separator({axis, position: separator_position})

        if (type === LINE_TYPE.SIGHT)
            if (separator.structure?.blocks_line_of_sight) return false
        if (type === LINE_TYPE.EFFECT)
            if (separator.structure?.blocks_line_of_effect) return false

        const dest = {...position, [axis]: position[axis] + direction}
        const dest_square = get_square({...dest, footprint: 1})

        if (type === LINE_TYPE.SIGHT)
            if (dest_square.structure?.blocks_line_of_sight) return false
        if (type === LINE_TYPE.EFFECT)
            if (dest_square.structure?.blocks_line_of_effect) return false

        return true
    }

    const is_terrain_occupied = (position: Position, {exclude}: { exclude?: Array<Creature> } = {}): boolean => {
        for (const p1 of transform_position_to_f1(position))
            for (const creature of creatures.get_all().filter(c => exclude ? !exclude.includes(c) : true))
                for (const p2 of transform_position_to_f1(creature.data.position))
                    if (positions_equal_footprint_one(p1, p2)) return true
        return false
    }

    const is_blocked_by_structure = (position: Position): boolean => {
        for (const p of transform_position_to_f1(position)) {
            const structure = get_square(p).structure
            if (structure?.blocks_movement) return true
        }
        return false
    }

    const blocks_movement = (position: Position, {exclude}: { exclude?: Array<Creature> } = {}): boolean => {
        return is_terrain_occupied(position, {exclude}) || is_blocked_by_structure(position)
    }

    const get_creature_by_position = (position: Position): Creature => {
        const creature = creatures.get_all().find(creature => positions_share_surface(creature.data.position, position))
        assert_is_not_undefined(creature)
        return creature
    }

    const get_creatures_in_positions = (positions: Array<PositionFootprintOne>): Array<Creature> => {
        const creatures = positions.filter(position => is_terrain_occupied(position)).map(get_creature_by_position)
        return [...new Set(creatures)]
    }

    return {
        size,

        get_board,
        get_square,
        get_squares,
        get_separator_x_axis,
        get_separator_y_axis,
        is_terrain_occupied,
        blocks_movement,
        get_creature_by_position,
        get_creatures_in_positions,

        can_trace_line_towards
    }
}

export type BattleGrid = ReturnType<typeof create_battle_grid>

export type BoardPosition = {
    structure: Structure | null
}

export type PositionBasic = { x: number, y: number }

export const LINE_TYPE = {
    SIGHT: "line_of_sight" as const,
    EFFECT: "line_of_effect" as const,
}

export type LineType = typeof LINE_TYPE[keyof typeof LINE_TYPE]