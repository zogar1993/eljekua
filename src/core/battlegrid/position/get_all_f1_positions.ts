import type {PositionFootprintOne} from "core/battlegrid/Position";
import type {BattleGrid} from "core/battlegrid/BattleGrid";

export const get_all_f1_positions = ({battle_grid}: {
    battle_grid: BattleGrid
}): Array<PositionFootprintOne> => {
    const positions: Array<PositionFootprintOne> = []

    for (let x = 0; x < battle_grid.size.x; x++)
        for (let y = 0; y < battle_grid.size.y; y++)
            positions.push({x, y, footprint: 1})

    return positions
}
