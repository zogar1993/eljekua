import {initialize_matrix} from "stdlib/initialize_matrix";
import type {BattleGrid, LineType, PositionBasic} from "core/battlegrid/BattleGrid";
import {assert_is_included, assert_is_lower_than, assert_is_not_empty} from "stdlib/assert";
import {positions_basic_equal} from "core/battlegrid/Position";

const get_quadrants_for_position = ({position, map_border, max_distance}: {
    position: PositionBasic,
    map_border: Record<"n" | "e" | "s" | "w", number>,
    max_distance?: number
}) => {
    const area_border = get_area_border({position, map_border, max_distance})

    const w = {first: area_border.w, last: position.x - 1}
    const e = {first: position.x + 1, last: area_border.e}
    const horizontal_hemisphere = [w, e]

    const n = {first: area_border.n, last: position.y - 1}
    const s = {first: position.y + 1, last: area_border.s}
    const vertical_hemispheres = [n, s]

    // Each quadrant is a part of the grid that is on the same diagonal from the origin
    const quadrants = []
    for (const x_range of horizontal_hemisphere)
        for (const y_range of vertical_hemispheres)
            quadrants.push({x_range, y_range})
    return quadrants;
}

//TODO Need to contemplate obstacles that occupy a position
export const create_line_trace_grid = ({battle_grid, orig, line_type, max_distance}: {
    battle_grid: BattleGrid,
    orig: PositionBasic,
    line_type: LineType,
    max_distance?: number
}) => {
    const trace_grid = initialize_matrix({width: battle_grid.size.x, height: battle_grid.size.y, value: false})
    trace_grid[orig.y][orig.x] = true

    const map_border = {n: 0, e: battle_grid.size.x - 1, s: battle_grid.size.y - 1, w: 0}
    const area_border = get_area_border({position: orig, map_border, max_distance})

    const orthogonal_paths: Array<{ movement_pattern: MovementPattern, dest: PositionBasic }> = [
        {dest: {...orig, x: area_border.w}, movement_pattern: {axes: ["x"], directions: {x: -1, y: 0}}},
        {dest: {...orig, x: area_border.e}, movement_pattern: {axes: ["x"], directions: {x: 1, y: 0}}},
        {dest: {...orig, y: area_border.n}, movement_pattern: {axes: ["y"], directions: {x: 0, y: -1}}},
        {dest: {...orig, y: area_border.s}, movement_pattern: {axes: ["y"], directions: {x: 0, y: 1}}},
    ]

    for (const orthogonal_path of orthogonal_paths)
        check_trace({battle_grid, line_type, trace_grid, i: 0, curr: orig, ...orthogonal_path})

    const quadrants = get_quadrants_for_position({position: orig, map_border, max_distance});

    // We go from the origin to each of the border pixels,
    // each entry in border_loop_data represents a border
    // TODO check borders of quadrants first
    for (const {x_range, y_range} of quadrants) {
        for (let x = x_range.first; x <= x_range.last; x++) {
            for (let y = y_range.first; y <= y_range.last; y++) {
                if (orig.x === x && orig.y === y) continue

                const dest = {x, y}

                for (const trace_path of TRACE_PATHS) {
                    if (check_trace_from_orig_to_dest_diagonal({orig, dest, trace_path, battle_grid, line_type, trace_grid}))
                        break
                }
            }
        }
    }

    return trace_grid
}

type TracePath = {
    first_move_axis: "x" | "y",
    move_priority_axis: "x" | "y",
    last_move_axis: "x" | "y"
}

const TRACE_PATHS: Array<TracePath> = [
    // These are the outer lines of the trace
    {first_move_axis: "x", move_priority_axis: "y", last_move_axis: "y"},
    {first_move_axis: "y", move_priority_axis: "x", last_move_axis: "x"},
    // These are the inner lines of the trace
    {first_move_axis: "x", move_priority_axis: "x", last_move_axis: "x"},
    {first_move_axis: "x", move_priority_axis: "y", last_move_axis: "x"},
    {first_move_axis: "y", move_priority_axis: "x", last_move_axis: "y"},
    {first_move_axis: "y", move_priority_axis: "y", last_move_axis: "y"}
]

const check_trace_from_orig_to_dest_diagonal = ({battle_grid, line_type, trace_path, orig, trace_grid, dest}: {
    battle_grid: BattleGrid,
    line_type: LineType,
    trace_path: TracePath,
    trace_grid: Array<Array<boolean>>,
    orig: PositionBasic,
    dest: PositionBasic
}) => {
    const full_path_distance = {x: dest.x - orig.x, y: dest.y - orig.y}
    const {first_move_axis, move_priority_axis, last_move_axis} = trace_path

    const first_move_direction = Math.sign(full_path_distance[first_move_axis])
    const first_move_params = {position: orig, axis: first_move_axis, direction: first_move_direction}
    const first = next_position(first_move_params)
    if (!battle_grid.can_trace_line_towards({...first_move_params, type: line_type}))
        return false
    trace_grid[first.y][first.x] = true

    if (positions_basic_equal(first, dest)) return true

    const last_move_direction = Math.sign(full_path_distance[last_move_axis])
    const last = next_position({position: dest, axis: last_move_axis, direction: -last_move_direction})

    const sub_path_distance = {x: last.x - first.x, y: last.y - first.y}

    if (sub_path_distance.x + full_path_distance.x === 0 || sub_path_distance.y + full_path_distance.y === 0)
        return false

    const movement_pattern = create_movement_pattern({distance: sub_path_distance, axis_priority: move_priority_axis})

    const result = check_trace({battle_grid, line_type, curr: first, movement_pattern, trace_grid, dest: last, i: 0})

    if (!result) return false

    const last_move_params = {position: last, axis: last_move_axis, direction: last_move_direction}
    if (battle_grid.can_trace_line_towards({...last_move_params, type: line_type})) {
        trace_grid[dest.y][dest.x] = true
        return true
    }

    return false
}

const check_trace = ({i, ...props}: {
    i: number
    battle_grid: BattleGrid,
    line_type: LineType,
    movement_pattern: ReturnType<typeof create_movement_pattern>,
    trace_grid: Array<Array<boolean>>,
    curr: PositionBasic,
    dest: PositionBasic,
}) => {
    if (positions_basic_equal(props.curr, props.dest)) return true

    assert_is_lower_than(i, MAXIMUM_STACK_LENGTH)

    const {battle_grid, line_type, trace_grid, curr, movement_pattern} = props

    const axis = movement_pattern.axes[i % movement_pattern.axes.length]
    const direction = movement_pattern.directions[axis]

    const next = next_position({position: curr, axis, direction})
    if (battle_grid.can_trace_line_towards({position: curr, axis, direction, type: line_type})) {
        trace_grid[next.y][next.x] = true
        return check_trace({...props, curr: next, i: i + 1})
    }

    return false
}

//TODO generate this based on map size
const PRIME_FACTORS = [2, 3, 5, 7] as const

const create_movement_pattern = ({distance, axis_priority}: {
    distance: { x: number, y: number },
    axis_priority: "x" | "y"
}): MovementPattern => {
    const directions = {x: Math.sign(distance.x), y: Math.sign(distance.y)}

    if (distance.x === 0) return {axes: ["y"], directions}
    if (distance.y === 0) return {axes: ["x"], directions}

    // the values are reversed for intervals and distances
    // the greater the distance, the less frequent the intervals
    const y_abs = Math.abs(distance.x)
    const x_abs = Math.abs(distance.y)

    const interval = {x: x_abs, y: y_abs}

    for (const prime of PRIME_FACTORS) {
        const min = Math.min(x_abs, y_abs)

        if (prime > min) break

        while (interval.x % prime === 0 && interval.y % prime === 0) {
            interval.x = interval.x / prime
            interval.y = interval.y / prime
        }
    }

    const movement_pattern: Array<"x" | "y"> = []
    const axis_secondary = axis_priority === "x" ? "y" : "x"

    for (let i = Math.min(interval.x, interval.y); i <= interval.x * interval.y; i++) {
        if (i % interval[axis_priority] === 0) movement_pattern.push(axis_priority)
        if (i % interval[axis_secondary] === 0) movement_pattern.push(axis_secondary)
    }

    assert_is_not_empty(movement_pattern)

    return {axes: movement_pattern, directions}
}

type MovementPattern = {
    axes: Array<"x" | "y">,
    directions: { x: number, y: number }
}

const MAXIMUM_STACK_LENGTH = 30

const next_position = ({position, axis, direction}: {
    position: PositionBasic,
    axis: "x" | "y",
    direction: number
}) => {
    assert_is_included(direction, [-1, 1])

    const x = axis === "x" ? position.x + direction : position.x
    const y = axis === "y" ? position.y + direction : position.y

    return {x, y}
}

const get_area_border = ({position, map_border, max_distance}: {
    position: PositionBasic,
    map_border: Record<"n" | "e" | "s" | "w", number>,
    max_distance?: number
}) => ({
    w: max_distance ? Math.max(map_border.w, position.x - max_distance) : map_border.w,
    e: max_distance ? Math.min(map_border.e, position.x + max_distance) : map_border.e,
    n: max_distance ? Math.max(map_border.n, position.y - max_distance) : map_border.n,
    s: max_distance ? Math.min(map_border.s, position.y + max_distance) : map_border.s,
})