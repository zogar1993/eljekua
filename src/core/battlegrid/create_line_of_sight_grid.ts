import {initialize_matrix} from "stdlib/initialize_matrix";
import {BattleGrid, PositionBasic} from "core/battlegrid/BattleGrid";
import {assert_are_equal} from "stdlib/assert";
import type {Structure} from "core/battlegrid/Structure";


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

export const create_line_of_sight_grid = ({battle_grid, orig}: {
    battle_grid: BattleGrid,
    orig: PositionBasic,
}) => {
    const sight_grid = initialize_matrix({width: battle_grid.size.x, height: battle_grid.size.y, value: false})
    sight_grid[orig.y][orig.x] = true

    //orthogonal sight leftwards
    for (let x = orig.x; x > 0; x--) {
        const next_x = x - 1
        const separator = battle_grid.get_separator_y_axis({x: next_x, y: orig.y})

        if (separator.structure?.blocks_line_of_sight) break

        sight_grid[orig.y][next_x] = true
    }

    //orthogonal sight rightwards
    for (let x = orig.x; x < battle_grid.size.x - 1; x++) {
        const next_x = x + 1
        const separator = battle_grid.get_separator_y_axis({x, y: orig.y})

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
    for (const {x_range, y_range} of quadrants) {
        for (let x = x_range.first; x <= x_range.last; x++) {
            for (let y = y_range.first; y <= y_range.last; y++) {
                if (orig.x === x && orig.y === y) continue

                const dest = {x, y}
                const dx = dest.x - orig.x
                const dy = dest.y - orig.y

                const {interval, simplification_factor} = simplify_interval({dx, dy})

                const x_sign = Math.sign(dx)
                const y_sign = Math.sign(dy)

                const next_x_move_for = (position: PositionBasic) => ({x: position.x + x_sign, y: position.y})
                const next_y_move_for = (position: PositionBasic) => ({x: position.x, y: position.y + y_sign})
                const has_y_los_between = (a: PositionBasic, b: PositionBasic) => {
                    assert_are_equal(a.x, b.x)
                    assert_are_equal(Math.abs(a.y - b.y), 1)
                    const separator = battle_grid.get_separator_y_axis({x: a.x, y: Math.min(a.y, b.y)})

                    return !separator_blocks_line_of_sight(separator.structure)
                }
                const has_x_los_between = (a: PositionBasic, b: PositionBasic) => {
                    assert_are_equal(a.y, b.y)
                    assert_are_equal(Math.abs(a.x - b.x), 1)
                    const separator = battle_grid.get_separator_x_axis({x: Math.min(a.x, b.x), y: a.y})

                    return !separator_blocks_line_of_sight(separator.structure)
                }

                const first_x_prio = next_y_move_for(orig)
                const first_y_prio = next_x_move_for(orig)
                let x_prio = {current: first_x_prio, active: has_y_los_between(orig, first_x_prio)}
                let y_prio = {current: first_y_prio, active: has_x_los_between(orig, first_y_prio)}

                let i = Math.min(interval.x, interval.y)
                const end = interval.x * interval.y * simplification_factor - i
                while ((x_prio.active || y_prio.active) && i <= end) {
                    const move_x = i % interval.x === 0
                    const move_y = i % interval.y === 0

                    if (move_x && move_y) {
                        if (x_prio.active) {
                            const next_x_move = next_x_move_for(x_prio.current)
                            if (has_x_los_between(x_prio.current, next_x_move)) {
                                sight_grid[next_x_move.y][next_x_move.x] = true
                                const next_y_move = next_y_move_for(next_x_move)
                                if (has_y_los_between(next_x_move, next_y_move)) {
                                    sight_grid[next_y_move.y][next_y_move.x] = true
                                    x_prio.current = next_y_move
                                } else
                                    x_prio.active = false
                            } else
                                x_prio.active = false
                        }

                        if (y_prio.active) {
                            const next_y_move = next_y_move_for(y_prio.current)
                            if (has_y_los_between(y_prio.current, next_y_move)) {
                                sight_grid[next_y_move.y][next_y_move.x] = true
                                const next_x_move = next_x_move_for(next_y_move)
                                if (has_x_los_between(next_y_move, next_x_move)) {
                                    sight_grid[next_x_move.y][next_x_move.x] = true
                                    y_prio.current = next_x_move
                                } else
                                    y_prio.active = false
                            } else
                                y_prio.active = false
                        }
                    } else if (move_x && x_prio.active) {
                        const next_move = next_x_move_for(x_prio.current)
                        if (has_x_los_between(x_prio.current, next_move)) {
                            sight_grid[next_move.y][next_move.x] = true
                            x_prio.current = next_move
                        } else
                            x_prio.active = false
                    } else if (move_y && y_prio.active) {
                        const next_move = next_y_move_for(y_prio.current)
                        if (has_y_los_between(y_prio.current, next_move)) {
                            sight_grid[next_move.y][next_move.x] = true
                            y_prio.current = next_move
                        } else
                            y_prio.active = false
                    }
                    i++
                }
            }
        }
    }

    return sight_grid
}

const PRIME_FACTORS = [2, 3, 5, 7] as const

const simplify_interval = ({dx, dy}: { dx: number, dy: number }) => {
    const x_sign = Math.sign(dx)
    const y_sign = Math.sign(dy)
    const x_abs = Math.abs(dx)
    const y_abs = Math.abs(dy)

    const intervals_abs = {x: x_abs, y: y_abs}

    let simplification_factor = 1

    for (const prime of PRIME_FACTORS) {
        const min = Math.min(x_abs, y_abs)

        if (prime > min) break

        while (intervals_abs.x % prime === 0 && intervals_abs.y % prime === 0) {
            intervals_abs.x = intervals_abs.x / prime
            intervals_abs.y = intervals_abs.y / prime
            simplification_factor *= prime
        }
    }

    return {interval: {x: intervals_abs.x * x_sign, y: intervals_abs.y * y_sign}, simplification_factor}
}

const separator_blocks_line_of_sight = (structure: Structure | null): boolean =>
    structure?.blocks_line_of_sight ?? false