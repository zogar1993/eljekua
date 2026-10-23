import {initialize_matrix} from "stdlib/initialize_matrix";
import {BattleGrid, PositionBasic} from "core/battlegrid/BattleGrid";


export const create_line_of_sight_grid = ({battle_grid, orig}: {
    battle_grid: BattleGrid,
    orig: PositionBasic,
}) => {
    const sight_grid = initialize_matrix({width: battle_grid.size.x, height: battle_grid.size.y, value: false})
    sight_grid[orig.y][orig.x] = true

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
                        const next_y = y + sign
                        const separator = battle_grid.get_separator_y_axis({x: orig.x, y: Math.min(y, next_y)})

                        if (separator.structure?.blocks_line_of_sight) break

                        sight_grid[next_y][x] = true
                    }
                }

                if (dy === 0) {
                    const sign = Math.sign(dx)
                    for (let x = orig.x; x !== dest.x; x += sign) {
                        const next_x = x + sign
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
