import type {PositionFootprintOne} from "core/battlegrid/Position";
import {OPAQUE_SOLID_WALL} from "core/battlegrid/Structure";
import {create_test_game} from "tests/utils/create_test_game";
import {PositionBasic} from "core/battlegrid/BattleGrid";
import {create_line_of_sight_grid} from "core/battlegrid/create_line_of_sight_grid";


const SCENARIO__CORRIDOR_WITH_ENTRANCES = `
     |O|       ||X        |
     | . . . . || . . . . |
     |         ||X X X X X|
     | ._._._. || . . . . |
     | |     | ||X       X|
     | ._._._._|| . . . . |
     |         ||X X      |
     | ._._._._|| . . . . |
     |         ||X X      |
`

const parse_case = (cases: string) => {
    const lines = cases.trim().split("\n").map(x => x.trim())

    const test_data: {
        orig: PositionBasic,
        x_separators: Array<PositionBasic>,
        y_separators: Array<PositionBasic>,
        expectation: Array<Array<boolean>>,
    } = {
        orig: {x: 0, y: 0},
        x_separators: [],
        y_separators: [],
        expectation: [
            [true, true, true, true, true],
            [true, true, true, true, true],
            [true, true, true, true, true],
            [true, true, true, true, true],
            [true, true, true, true, true],
        ],
    }

    for (let x = 0; x < 5; x++)
        for (let y = 0; y < 5; y++) {
            const x2 = x * 2 + 12
            const y2 = y * 2
            test_data.expectation[y][x] = lines[y2][x2] === "X"
        }

    for (let x = 0; x < 5; x++)
        for (let y = 0; y < 4; y++) {
            const x2 = x * 2 + 1
            const y2 = y * 2 + 1
            if (lines[y2][x2] === "_")
                test_data.y_separators.push({x, y})
        }

    for (let x = 0; x < 4; x++)
        for (let y = 0; y < 5; y++) {
            const x2 = x * 2 + 2
            const y2 = y * 2
            if (lines[y2][x2] === "|")
                test_data.x_separators.push({x, y})
        }

    for (let x = 0; x < 5; x++)
        for (let y = 0; y < 5; y++) {
            const x2 = x * 2 + 1
            const y2 = y * 2
            if (lines[y2][x2] === "O")
                test_data.orig = {x, y}
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
test(`corridor with entrances`, () => {
    const data = parse_case(SCENARIO__CORRIDOR_WITH_ENTRANCES)

    const {battle_grid} = create_test_game({battle_grid_size: {x: 5, y: 5}})
    data.x_separators.forEach((pos) => set_x_separator(battle_grid, {...pos, footprint: 1}))
    data.y_separators.forEach((pos) => set_y_separator(battle_grid, {...pos, footprint: 1}))

    const los_grid = create_line_of_sight_grid({battle_grid, orig: data.orig})
    expect(los_grid).toEqual(data.expectation)
})

describe("line of sight", () => {
    [0, 1, 2, 3, 4].forEach(x =>
        [0, 1, 2, 3, 4].forEach(y =>
            test(`on an empty 5x5 battle grid, a creature at x${x} y${y} can see the whole map`, () => {
                const {battle_grid} = create_test_game({battle_grid_size: {x: 5, y: 5}})

                const los_grid = create_line_of_sight_grid({battle_grid, orig: {x, y}})
                expect(los_grid).toEqual([
                    [true, true, true, true, true],
                    [true, true, true, true, true],
                    [true, true, true, true, true],
                    [true, true, true, true, true],
                    [true, true, true, true, true],
                ])
            })
        )
    )
})

