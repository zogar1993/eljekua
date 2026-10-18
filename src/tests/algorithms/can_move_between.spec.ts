import {can_move_between} from "core/battlegrid/can_move_between";
import type {PositionFootprintOne} from "core/battlegrid/Position";
import {OPAQUE_SOLID_WALL, OPAQUE_TRANSVERSABLE_WALL} from "core/battlegrid/Structure";
import {create_test_game} from "tests/utils/create_test_game";
import {PositionBasic} from "core/battlegrid/BattleGrid";

const ORIGIN = {x: 1, y: 1, footprint: 1} as const
const EAST = {x: 2, y: 1, footprint: 1} as const
const SOUTH = {x: 1, y: 2, footprint: 1} as const
const SOUTH_EAST = {x: 2, y: 2, footprint: 1} as const


const VALID_DIAGONAL_CASES_WITH_ONE_WALL = `
     |O| |O  |O  |O  | |O|  O|  O|  O|D  |D| |D  |D  |  D| |D|  D|  D|
     |   |   |-  |  -|   |   |  -|-  |   |   |  -|-  |   |   |-  |  -|
     |  D| |D|  D|  D|D  |D| |D  |D  | |O|  O|  O|  O|O| |O  |O  |O  |
    `
const VALID_DIAGONAL_CASES_WITH_TWO_WALLS = `
     |O| |O  | |O|  O|D| |D  | |D|  D|
     |  -|-  |-  |  -|  -|-  |-  |  -| 
     |  D| |D|D  |D| |  O| |O|O  |O| |
    `
const parse_cases = (cases: string) => {
    const lines = cases.trim().split("\n").map(x => x.trim())

    const test_data: Array<{
        orig: PositionBasic,
        dest: PositionBasic,
        x_separators: Array<PositionBasic>,
        y_separators: Array<PositionBasic>
    }> = []
    for (let i = 1; i < lines[0].length; i += 4) {
        const x1y0 = lines[0][i + 2]
        const x0y1 = lines[2][i]
        const x1y1 = lines[2][i + 2]

        const orig_x = x1y0 === "O" || x1y1 === "O" ? 1 : 0
        const orig_y = x0y1 === "O" || x1y1 === "O" ? 1 : 0
        const dest_x = x1y0 === "D" || x1y1 === "D" ? 1 : 0
        const dest_y = x0y1 === "D" || x1y1 === "D" ? 1 : 0
        const orig = {x: orig_x, y: orig_y} as const
        const dest = {x: dest_x, y: dest_y} as const

        const data = {
            orig,
            dest,
            x_separators: [] as Array<PositionBasic>,
            y_separators: [] as Array<PositionBasic>
        }
        if (lines[0][i + 1] === "|")
            data.x_separators.push({x: 0, y: 0})
        if (lines[2][i + 1] === "|")
            data.x_separators.push({x: 0, y: 1})
        if (lines[1][i] === "-")
            data.y_separators.push({x: 0, y: 0})
        if (lines[1][i + 2] === "-")
            data.y_separators.push({x: 1, y: 0})
        test_data.push(data)
    }

    return test_data
}

const set_x_separator = (
    battle_grid: ReturnType<typeof create_test_game>["battle_grid"],
    position: PositionFootprintOne,
) => {
    battle_grid.get_separator_x_axis(position).structure = OPAQUE_SOLID_WALL
}

const set_y_separator = (
    battle_grid: ReturnType<typeof create_test_game>["battle_grid"],
    position: PositionFootprintOne,
) => {
    battle_grid.get_separator_y_axis(position).structure = OPAQUE_SOLID_WALL
}

describe("can_move_between", () => {
    test("x-axis separator blocks horizontal movement in both directions", () => {
        const {battle_grid} = create_test_game({battle_grid_size: {x: 5, y: 5}})
        set_x_separator(battle_grid, ORIGIN)

        expect(can_move_between(battle_grid, ORIGIN, EAST)).toBe(false)
        expect(can_move_between(battle_grid, EAST, ORIGIN)).toBe(false)
    })

    test("y-axis separator blocks vertical movement in both directions", () => {
        const {battle_grid} = create_test_game({battle_grid_size: {x: 5, y: 5}})
        set_y_separator(battle_grid, ORIGIN)

        expect(can_move_between(battle_grid, ORIGIN, SOUTH)).toBe(false)
        expect(can_move_between(battle_grid, SOUTH, ORIGIN)).toBe(false)
    })

    test("diagonal movement is blocked only when both adjacent separators block", () => {
        const {battle_grid} = create_test_game({battle_grid_size: {x: 5, y: 5}})
        set_x_separator(battle_grid, ORIGIN)

        expect(can_move_between(battle_grid, ORIGIN, SOUTH_EAST)).toBe(true)
    })

    test("diagonal movement is blocked when both adjacent separators block", () => {
        const {battle_grid} = create_test_game({battle_grid_size: {x: 5, y: 5}})
        set_x_separator(battle_grid, ORIGIN)
        set_y_separator(battle_grid, ORIGIN)

        expect(can_move_between(battle_grid, ORIGIN, SOUTH_EAST)).toBe(false)
    })

    test("does not block passage when separator structure does not block movement", () => {
        const {battle_grid} = create_test_game({battle_grid_size: {x: 5, y: 5}})
        battle_grid.get_separator_x_axis(ORIGIN).structure = OPAQUE_TRANSVERSABLE_WALL

        expect(can_move_between(battle_grid, ORIGIN, EAST)).toBe(true)
    })

    parse_cases(VALID_DIAGONAL_CASES_WITH_ONE_WALL).forEach(({orig, dest, x_separators, y_separators}) => {
        test(`diagonal movement with one wall from ${JSON.stringify(orig)} to ${JSON.stringify(dest)} with x separators ${JSON.stringify(x_separators)} and y separators ${JSON.stringify(y_separators)}`, () => {
            const {battle_grid} = create_test_game({battle_grid_size: {x: 2, y: 2}})
            x_separators.forEach((pos) => set_x_separator(battle_grid, {...pos, footprint: 1}))
            y_separators.forEach((pos) => set_y_separator(battle_grid, {...pos, footprint: 1}))

            const result = can_move_between(battle_grid, {...orig, footprint: 1}, {...dest, footprint: 1})

            expect(result).toBe(true)
        })
    })

    parse_cases(VALID_DIAGONAL_CASES_WITH_TWO_WALLS).forEach(({orig, dest, x_separators, y_separators}) => {
        test(`diagonal movement with two walls from ${JSON.stringify(orig)} to ${JSON.stringify(dest)} with x separators ${JSON.stringify(x_separators)} and y separators ${JSON.stringify(y_separators)}`, () => {
            const {battle_grid} = create_test_game({battle_grid_size: {x: 2, y: 2}})
            x_separators.forEach((pos) => set_x_separator(battle_grid, {...pos, footprint: 1}))
            y_separators.forEach((pos) => set_y_separator(battle_grid, {...pos, footprint: 1}))

            const result = can_move_between(battle_grid, {...orig, footprint: 1}, {...dest, footprint: 1})

            expect(result).toBe(true)
        })
    })
})

