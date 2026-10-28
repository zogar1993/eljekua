import type {Position, PositionFootprintOne} from "core/battlegrid/Position";
import {assert_is_footprint_one} from "core/battlegrid/Position";
import type {BattleGrid} from "core/battlegrid/BattleGrid";
import {create_line_of_sight_grid} from "core/battlegrid/create_line_of_sight_grid";

export const get_reach_line_of_sight = ({origin, battle_grid}: {
    origin: Position,
    battle_grid: BattleGrid
}): Array<PositionFootprintOne> => {
    assert_is_footprint_one(origin)
    const sight_grid = create_line_of_sight_grid({battle_grid, orig: origin})
    const positions: Array<PositionFootprintOne> = []

    for (let x = 0; x < battle_grid.size.x; x++)
        for (let y = 0; y < battle_grid.size.y; y++)
            if (sight_grid[y][x])
                positions.push({x, y, footprint: 1})

    return positions
}
