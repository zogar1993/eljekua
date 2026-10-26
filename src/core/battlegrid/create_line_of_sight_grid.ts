import {initialize_matrix} from "stdlib/initialize_matrix";
import {BattleGrid, PositionBasic} from "core/battlegrid/BattleGrid";
import {assert_are_equal, assert_are_not_equal, assert_is_not_empty} from "stdlib/assert";
import type {Structure} from "core/battlegrid/Structure";
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

    //orthogonal sight leftwards
    for (let x = orig.x; x > 0; x--) {
        const next_x = x - 1
        const separator = battle_grid.get_separator_x_axis({x: next_x, y: orig.y})

        if (separator.structure?.blocks_line_of_sight) break

        sight_grid[orig.y][next_x] = true
    }

    //orthogonal sight rightwards
    for (let x = orig.x; x < battle_grid.size.x - 1; x++) {
        const next_x = x + 1
        const separator = battle_grid.get_separator_x_axis({x, y: orig.y})

        if (separator.structure?.blocks_line_of_sight) break

        sight_grid[orig.y][next_x] = true
    }

    //orthogonal sight upwards
    for (let y = orig.y; y > 0; y--) {
        const next_y = y - 1
        const separator = battle_grid.get_separator_y_axis({x: orig.x, y: next_y})

        if (separator.structure?.blocks_line_of_sight) break

        sight_grid[next_y][orig.x] = true
    }

    //orthogonal sight downwards
    for (let y = orig.y; y < battle_grid.size.y - 1; y++) {
        const next_y = y + 1
        const separator = battle_grid.get_separator_y_axis({x: orig.x, y})

        if (separator.structure?.blocks_line_of_sight) break

        sight_grid[next_y][orig.x] = true
    }

    const quadrants = get_quadrants_for_position({position: orig, battle_grid});

    // We go from the origin to each of the border pixels,
    // each entry in border_loop_data represents a border
    // TODO check borders of quadrants first
    for (const {x_range, y_range} of quadrants) {
        for (let x = x_range.first; x <= x_range.last; x++) {
            for (let y = y_range.first; y <= y_range.last; y++) {
                if (orig.x === x && orig.y === y) continue

                const dest = {x, y}
                const dx = dest.x - orig.x
                const dy = dest.y - orig.y

                const slope = {sign: {x: Math.sign(dx), y: Math.sign(dy)}}

                const movement_kit: Record<"x" | "y", MovementKit> = {
                    x: {
                        next_move_for: (position: PositionBasic) => ({x: position.x + slope.sign.x, y: position.y}),
                        prev_move_for: (position: PositionBasic) => ({x: position.x - slope.sign.x, y: position.y}),
                        has_los_between: (a: PositionBasic, b: PositionBasic) => {
                            assert_are_equal(a.y, b.y)
                            assert_are_equal(Math.abs(a.x - b.x), 1)
                            const separator = battle_grid.get_separator_x_axis({x: Math.min(a.x, b.x), y: a.y})

                            return !separator_blocks_line_of_sight(separator.structure)
                        }
                    },
                    y: {
                        next_move_for: (position: PositionBasic) => ({x: position.x, y: position.y + slope.sign.y}),
                        prev_move_for: (position: PositionBasic) => ({x: position.x, y: position.y - slope.sign.y}),
                        has_los_between: (a: PositionBasic, b: PositionBasic) => {
                            assert_are_equal(a.x, b.x)
                            assert_are_equal(Math.abs(a.y - b.y), 1)
                            const separator = battle_grid.get_separator_y_axis({x: a.x, y: Math.min(a.y, b.y)})

                            return !separator_blocks_line_of_sight(separator.structure)
                        }
                    }
                }

                const movement_pattern = create_movement_pattern({dx, dy})

                for (const sight_path of SIGHT_PATHS) {
                    if (check_sight_path({
                        sight_path,
                        movement_kit,
                        orig,
                        movement_pattern,
                        sight_grid,
                        dest,
                        slope,
                        battle_grid
                    }))
                        break
                }
            }
        }
    }

    return sight_grid
}

type MovementKit = {
    next_move_for: (position: PositionBasic) => PositionBasic,
    prev_move_for: (position: PositionBasic) => PositionBasic,
    has_los_between: (a: PositionBasic, b: PositionBasic) => boolean
}

type SightPath = {
    start_move: "x" | "y",
    move_priority: "x" | "y",
    end_move: "x" | "y"
}

const SIGHT_PATHS: Array<SightPath> = [
    // These are the outer lines of the sight
    {start_move: "x", move_priority: "y", end_move: "y"},
    {start_move: "y", move_priority: "x", end_move: "x"},
    // These are the inner lines of sight
    {start_move: "x", move_priority: "x", end_move: "x"},
    {start_move: "x", move_priority: "y", end_move: "x"},
    {start_move: "y", move_priority: "x", end_move: "y"},
    {start_move: "y", move_priority: "y", end_move: "y"}
]

const check_sight_path = ({movement_kit, sight_path, orig, movement_pattern, sight_grid, dest, slope, battle_grid}: {
    battle_grid: BattleGrid,
    movement_kit: Record<"x" | "y", MovementKit>,
    sight_path: SightPath,
    movement_pattern: ReturnType<typeof create_movement_pattern>,
    sight_grid: Array<Array<boolean>>,
    slope: { sign: { x: number, y: number } },
    orig: PositionBasic,
    dest: PositionBasic
}) => {
    let first = movement_kit[sight_path.start_move].next_move_for(orig)

    if (!movement_kit[sight_path.start_move].has_los_between(orig, first)) return false
    sight_grid[first.y][first.x] = true
    if (positions_basic_equal(first, dest)) return true

    const last = movement_kit[sight_path.end_move].prev_move_for(dest)
    const sub_slope = {x: last.x - first.x, y: last.y - first.y}

    const perform_last_move = () => {
        if (movement_kit[sight_path.end_move].has_los_between(last, dest)) {
            sight_grid[dest.y][dest.x] = true
            return true
        } else
            return false
    }

    if (positions_basic_equal(last, first))
        return perform_last_move()

    if (sub_slope.x === 0) {
        assert_are_not_equal(sub_slope.y, 0)

        const sign_y = Math.sign(sub_slope.y)
        const x = first.x
        let y = first.y + sign_y
        while (positions_basic_equal({y, x}, dest)) {
            const next_y = y + sign_y
            const separator = battle_grid.get_separator_y_axis({x, y: Math.min(next_y, y)})

            if (separator.structure?.blocks_line_of_sight) return false

            sight_grid[next_y][x] = true

            y = next_y
        }

        return perform_last_move()
    }

    if (sub_slope.y === 0) {
        assert_are_not_equal(sub_slope.x, 0)

        const sign_x = Math.sign(sub_slope.x)
        const y = first.y
        let x = first.x + sign_x

        while (!positions_basic_equal({y, x}, last)) {
            const next_x = x + sign_x
            const separator = battle_grid.get_separator_x_axis({x: Math.min(next_x, x), y})

            if (separator.structure?.blocks_line_of_sight) return false

            sight_grid[y][next_x] = true

            x = next_x
        }

        return perform_last_move()
    }

    if (slope.sign.x !== Math.sign(sub_slope.x) || slope.sign.y !== Math.sign(sub_slope.y)) return false

    const result = recur_check_sight_path({
        movement_kit,
        sight_path,
        curr: first,
        movement_pattern,
        sight_grid,
        dest: last,
        i: 0,
        leftover_movement: null
    })

    if (!result) return false

    return perform_last_move()
}

const recur_check_sight_path = ({i, ...props}: {
    i: number
    movement_kit: Record<"x" | "y", MovementKit>,
    sight_path: SightPath,
    movement_pattern: ReturnType<typeof create_movement_pattern>,
    sight_grid: Array<Array<boolean>>,
    curr: PositionBasic,
    dest: PositionBasic,
    leftover_movement: "x" | "y" | null
}) => {
    if (positions_basic_equal(props.curr, props.dest)) return true

    const {movement_kit, sight_grid, curr, movement_pattern, sight_path} = props

    if (props.leftover_movement) {
        const {leftover_movement} = props
        const next = movement_kit[leftover_movement].next_move_for(curr)
        if (movement_kit[leftover_movement].has_los_between(curr, next)) {
            sight_grid[next.y][next.x] = true
            if (recur_check_sight_path({...props, i: i + 1, leftover_movement: props.leftover_movement}))
                return true
        }
    }

    //TODO this could be a very hacky mask once its working properly
    const next_movements = movement_pattern[i % movement_pattern.length]

    const move_axis = next_movements.length === 1 ? next_movements[0] : sight_path.move_priority ?? "x"
    const leftover_movement = next_movements.length === 1 ? null : move_axis === "x" ? "y" : "x"

    const next = movement_kit[move_axis].next_move_for(curr)
    if (movement_kit[move_axis].has_los_between(curr, next)) {
        sight_grid[next.y][next.x] = true
        if (recur_check_sight_path({...props, i: i + 1, leftover_movement}))
            return true
    }

    return false
}


//TODO generate this based on map size
const PRIME_FACTORS = [2, 3, 5, 7] as const

const create_movement_pattern = ({dx, dy}: { dx: number, dy: number }) => {
    // the values are reversed for intervals and distances
    // the greater the distance, the less frequent the intervals
    const y_abs = Math.abs(dx)
    const x_abs = Math.abs(dy)

    const interval = {x: x_abs, y: y_abs}

    for (const prime of PRIME_FACTORS) {
        const min = Math.min(x_abs, y_abs)

        if (prime > min) break

        while (interval.x % prime === 0 && interval.y % prime === 0) {
            interval.x = interval.x / prime
            interval.y = interval.y / prime
        }
    }

    const movement_pattern: Array<Array<"x" | "y">> = []

    for (let i = Math.min(interval.x, interval.y); i <= interval.x * interval.y; i++) {
        const result: Array<"x" | "y"> = []
        if (i % interval.x === 0) result.push("x")
        if (i % interval.y === 0) result.push("y")
        if (result.length === 0) continue
        movement_pattern.push(result)
    }

    assert_is_not_empty(movement_pattern)
    if (movement_pattern.length > 1)
        assert_are_equal(movement_pattern[0].length, 1)
    else
        assert_are_equal(movement_pattern[0].length, 2)

    return movement_pattern
}

const separator_blocks_line_of_sight = (structure: Structure | null): boolean =>
    structure?.blocks_line_of_sight ?? false