import {initialize_matrix} from "stdlib/initialize_matrix";
import {BattleGrid, LINE_TYPE, PositionBasic} from "core/battlegrid/BattleGrid";
import {assert_is_included, assert_is_lower_than, assert_is_not_empty} from "stdlib/assert";
import {positions_basic_equal} from "core/battlegrid/Position";


function get_quadrants_for_position({position, battle_grid}: { position: PositionBasic, battle_grid: BattleGrid }) {
    const w = {first: 0, last: position.x - 1}
    const e = {first: position.x + 1, last: battle_grid.size.x - 1}
    const horizontal_hemisphere = [w, e]

    const n = {first: 0, last: position.y - 1}
    const s = {first: position.y + 1, last: battle_grid.size.y - 1}
    const vertical_hemispheres = [n, s]

    // Each quadrant is a part of the grid that is on the same diagonal from the origin
    const quadrants = []
    for (const x_range of horizontal_hemisphere)
        for (const y_range of vertical_hemispheres)
            quadrants.push({x_range, y_range})
    return quadrants;
}

//TODO Need to contemplate obstacles that occupy a position
export const create_line_of_sight_grid = ({battle_grid, orig}: {
    battle_grid: BattleGrid,
    orig: PositionBasic,
}) => {
    const sight_grid = initialize_matrix({width: battle_grid.size.x, height: battle_grid.size.y, value: false})
    sight_grid[orig.y][orig.x] = true

    const orthogonal_paths: Array<{ movement_pattern: MovementPattern, dest: PositionBasic }> = [
        {movement_pattern: {axes: ["x"], directions: {x: -1, y: 0}}, dest: {...orig, x: 0}},
        {movement_pattern: {axes: ["x"], directions: {x: 1, y: 0}}, dest: {...orig, x: battle_grid.size.x - 1}},
        {movement_pattern: {axes: ["y"], directions: {x: 0, y: -1}}, dest: {...orig, y: 0}},
        {movement_pattern: {axes: ["y"], directions: {x: 0, y: 1}}, dest: {...orig, y: battle_grid.size.y - 1}},
    ]

    for (const orthogonal_path of orthogonal_paths)
        check_sight({battle_grid, sight_grid, i: 0, curr: orig, ...orthogonal_path})

    const quadrants = get_quadrants_for_position({position: orig, battle_grid});

    // We go from the origin to each of the border pixels,
    // each entry in border_loop_data represents a border
    // TODO check borders of quadrants first
    for (const {x_range, y_range} of quadrants) {
        for (let x = x_range.first; x <= x_range.last; x++) {
            for (let y = y_range.first; y <= y_range.last; y++) {
                if (orig.x === x && orig.y === y) continue

                const dest = {x, y}

                for (const sight_path of SIGHT_PATHS) {
                    if (check_sight_from_orig_to_dest_diagonal({orig, dest, sight_path, battle_grid, sight_grid}))
                        break
                }
            }
        }
    }

    return sight_grid
}

type SightPath = {
    first_move_axis: "x" | "y",
    move_priority_axis: "x" | "y",
    last_move_axis: "x" | "y"
}

const SIGHT_PATHS: Array<SightPath> = [
    // These are the outer lines of the sight
    {first_move_axis: "x", move_priority_axis: "y", last_move_axis: "y"},
    {first_move_axis: "y", move_priority_axis: "x", last_move_axis: "x"},
    // These are the inner lines of sight
    {first_move_axis: "x", move_priority_axis: "x", last_move_axis: "x"},
    {first_move_axis: "x", move_priority_axis: "y", last_move_axis: "x"},
    {first_move_axis: "y", move_priority_axis: "x", last_move_axis: "y"},
    {first_move_axis: "y", move_priority_axis: "y", last_move_axis: "y"}
]

const check_sight_from_orig_to_dest_diagonal = ({battle_grid, sight_path, orig, sight_grid, dest}: {
    battle_grid: BattleGrid,
    sight_path: SightPath,
    sight_grid: Array<Array<boolean>>,
    orig: PositionBasic,
    dest: PositionBasic
}) => {
    const full_path_distance = {x: dest.x - orig.x, y: dest.y - orig.y}
    const {first_move_axis, move_priority_axis, last_move_axis} = sight_path

    const first_move_direction = Math.sign(full_path_distance[first_move_axis])
    const first_move_params = {position: orig, axis: first_move_axis, direction: first_move_direction}
    const first = next_position(first_move_params)
    if (!battle_grid.can_trace_line_towards({...first_move_params, type: LINE_TYPE.SIGHT}))
        return false
    sight_grid[first.y][first.x] = true

    if (positions_basic_equal(first, dest)) return true

    const last_move_direction = Math.sign(full_path_distance[last_move_axis])
    const last = next_position({position: dest, axis: last_move_axis, direction: -last_move_direction})

    const sub_path_distance = {x: last.x - first.x, y: last.y - first.y}

    if (sub_path_distance.x + full_path_distance.x === 0 || sub_path_distance.y + full_path_distance.y === 0)
        return false

    const movement_pattern = create_movement_pattern({distance: sub_path_distance, axis_priority: move_priority_axis})

    const result = check_sight({battle_grid, curr: first, movement_pattern, sight_grid, dest: last, i: 0})

    if (!result) return false

    const last_move_params = {position: last, axis: last_move_axis, direction: last_move_direction}
    if (battle_grid.can_trace_line_towards({...last_move_params, type: LINE_TYPE.SIGHT})) {
        sight_grid[dest.y][dest.x] = true
        return true
    }

    return false
}

const check_sight = ({i, ...props}: {
    i: number
    battle_grid: BattleGrid,
    movement_pattern: ReturnType<typeof create_movement_pattern>,
    sight_grid: Array<Array<boolean>>,
    curr: PositionBasic,
    dest: PositionBasic,
}) => {
    if (positions_basic_equal(props.curr, props.dest)) return true

    assert_is_lower_than(i, MAXIMUM_STACK_LENGTH)

    const {battle_grid, sight_grid, curr, movement_pattern} = props

    const axis = movement_pattern.axes[i % movement_pattern.axes.length]
    const direction = movement_pattern.directions[axis]

    const next = next_position({position: curr, axis, direction})
    if (battle_grid.can_trace_line_towards({position: curr, axis, direction, type: LINE_TYPE.SIGHT})) {
        sight_grid[next.y][next.x] = true
        return check_sight({...props, curr: next, i: i + 1})
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
