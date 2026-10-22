import type {BattleGrid, PositionBasic} from "core/battlegrid/BattleGrid";
import type {Position, PositionFootprintOne} from "core/battlegrid/Position";
import {assert_is_footprint_one} from "core/battlegrid/Position";
import type {Structure} from "core/battlegrid/Structure";
import {assert_is_true} from "stdlib/assert";
import {initialize_matrix} from "stdlib/initialize_matrix";

const separator_blocks_movement = (structure: Structure | null): boolean =>
    structure?.blocks_movement ?? false

//TODO probably can move footprint out of the positions and just have it live on the algorithms

//TODO make work for footprint > 1
export const can_move_between = (
    battle_grid: BattleGrid,
    orig: Position,
    dest: Position,
): boolean => {
    assert_is_footprint_one(orig)
    assert_is_footprint_one(dest)

    const dx = dest.x - orig.x
    const dy = dest.y - orig.y

    assert_is_true(dx !== 0 || dy !== 0)
    assert_is_true(Math.abs(dx) < 2)
    assert_is_true(Math.abs(dy) < 2)

    // checks if there is a barrier that prevents horizontal movement
    if (dy === 0) {
        const separator = battle_grid.get_separator_x_axis({x: Math.min(orig.x, dest.x), y: orig.y})
        return !separator_blocks_movement(separator.structure)
    }
    // checks if there is a barrier that prevents vertical movement
    if (dx === 0) {
        const separator = battle_grid.get_separator_y_axis({x: orig.x, y: Math.min(orig.y, dest.y)})
        return !separator_blocks_movement(separator.structure)
    }

    // checks for diagonal movement
    // for it to be valid we check the "+" that forms between the positions
    const min_x = Math.min(orig.x, dest.x)
    const min_y = Math.min(orig.y, dest.y)


    // if both hemispheres are separate, it can't move
    const separates_n = separator_blocks_movement(battle_grid.get_separator_x_axis({x: min_x, y: min_y}).structure)
    const separates_s = separator_blocks_movement(battle_grid.get_separator_x_axis({x: min_x, y: min_y + 1}).structure)
    if (separates_n && separates_s) return false

    const separates_e = separator_blocks_movement(battle_grid.get_separator_y_axis({x: min_x + 1, y: min_y}).structure)
    const separates_w = separator_blocks_movement(battle_grid.get_separator_y_axis({x: min_x, y: min_y}).structure)
    if (separates_e && separates_w) return false

    // if one of the positions is cornered, then it can't move
    const is_nw_to_se_diagonal = dx + dy !== 0
    if (is_nw_to_se_diagonal) {
        if (separates_n && separates_w) return false
        if (separates_s && separates_e) return false
    } else {
        if (separates_n && separates_e) return false
        if (separates_s && separates_w) return false
    }

    return true
}

const create_line_of_sight_grid = ({battle_grid, orig}: {
    battle_grid: BattleGrid,
    orig: PositionBasic,
}) => {
    const sight_grid = initialize_matrix({width: battle_grid.size.x, height: battle_grid.size.y, value: false})

    const last_x = battle_grid.size.x - 1
    const last_y = battle_grid.size.y - 1
    const border_loop_data = [
        {first: {x: 0, y: 0}, last: {x: last_x, y: 0}},
        {first: {x: 0, y: last_y}, last: {x: last_x, y: last_y}},
        {first: {x: 0, y: 1}, last: {x: 0, y: last_y - 1}},
        {first: {x: last_x, y: 1}, last: {x: last_x, y: last_y - 1}}
    ]

    // We go from the origin to each of the border pixels,
    // each entry in border_loop_data represents a border
    for (const {first, last} of border_loop_data) {
        for (let x = first.x; x <= last.x; x++) {
            for (let y = first.y; y <= last.y; y++) {
                if (orig.x === x && orig.y === y) continue

                const dest = {x, y}
                const dx = dest.x - orig.x
                const dy = dest.y - orig.y

                if (dx === 0) {
                    const sign = Math.sign(dy)
                    for (let y = orig.y; y !== dest.y; y += sign) {
                        const next_y = y += sign
                        const separator = battle_grid.get_separator_y_axis({x: orig.x, y: Math.min(y, next_y)})

                        if (separator.structure?.blocks_line_of_sight) break

                        sight_grid[next_y][x] = true
                    }
                }

                if (dy === 0) {
                    const sign = Math.sign(dx)
                    for (let x = orig.x; x !== dest.x; x += sign) {
                        const next_x = x += sign
                        const separator = battle_grid.get_separator_x_axis({x: Math.min(x, next_x), y: orig.y})

                        if (separator.structure?.blocks_line_of_sight) break

                        sight_grid[y][next_x] = true
                    }
                }

                const interval = simplify_interval({dx, dy})

                const start = Math.min(interval.x, interval.y)
                const end = interval.x * interval.y
                for (let i = start; i < end; i++) {

                }


                let x_interval = dx
                let y_interval = dy
            }
        }
    }
}

const PRIME_FACTORS = [2, 3, 5, 7] as const

const simplify_interval = ({dx, dy}: { dx: number, dy: number }) => {
    const x_sign = Math.sign(dx)
    const y_sign = Math.sign(dy)
    const x_abs = Math.abs(dx)
    const y_abs = Math.abs(dy)

    const intervals_abs = {x: x_abs, y: y_abs}

    for (const prime of PRIME_FACTORS) {
        const min = Math.min(x_abs, y_abs)

        if (prime > min) break

        while (intervals_abs.x % prime === 0 && intervals_abs.y % prime === 0) {
            intervals_abs.x = intervals_abs.x / prime
            intervals_abs.y = intervals_abs.y / prime
        }
    }

    return {x: intervals_abs.x * x_sign, y: intervals_abs.y * y_sign}

}

const can_see_through = ({battle_grid, orig, dest}: {
    battle_grid: BattleGrid,
    orig: Position,
    dest: Position,
}) => {
    assert_is_footprint_one(orig)
    assert_is_footprint_one(dest)

    const dx = dest.x - orig.x
    const dy = dest.y - orig.y

    assert_is_true(dx !== 0 || dy !== 0)
    assert_is_true(Math.abs(dx) < 2)
    assert_is_true(Math.abs(dy) < 2)

    if (dy === 0) {

    }
}
