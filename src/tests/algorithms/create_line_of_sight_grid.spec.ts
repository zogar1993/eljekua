import type {PositionFootprintOne} from "core/battlegrid/Position";
import {OPAQUE_SOLID_WALL} from "core/battlegrid/Structure";
import {create_test_game} from "tests/utils/create_test_game";
import {PositionBasic} from "core/battlegrid/BattleGrid";
import {create_line_of_sight_grid} from "core/battlegrid/create_line_of_sight_grid";


const VALID_DIAGONALS__ONE_WALL = `
     |         ||X X X X X|
     | . . . . || . . . . |
     |         ||X X X X X|
     | . . . . || . . . . |
     |    O    ||X X X X X|
     | . . . . || . . . . |
     |         ||X X X X X|
     | . . . . || . . . . |
     |         ||X X X X X|
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

describe("line of sight", () => {
    test(`on an empty 5x5 battle grid, a creature at xuxa can see the whole map`, () => {
        const x = 0
        const y = 0
        const {battle_grid} = create_test_game({battle_grid_size: {x: 5, y: 5}})

        const los_grid = create_line_of_sight_grid({battle_grid, orig: {x, y}})
        expect(los_grid).toEqual([
            [true, true, true, true, true],
            [true, true, true, true, true],
            [true, true, true, true, true],
            [true, true, true, true, true],
            [true, true, true, true, true],
        ])
    });

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

