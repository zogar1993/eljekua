import type {Position, PositionFootprintOne} from "scripts/battlegrid/Position";
import type {BattleGrid} from "scripts/battlegrid/BattleGrid";
import {positions_share_surface} from "scripts/battlegrid/Position";

export const get_f1_positions_within_distance = ({battle_grid, position, distance}: {
    position: Position,
    battle_grid: BattleGrid,
    distance: number
}): Array<PositionFootprintOne> => {
    const footprint = position.footprint
    const lower_x = Math.max(0, position.x - distance)
    const upper_x = Math.min(battle_grid.size.x - 1, position.x + footprint + distance - 1)
    const lower_y = Math.max(0, position.y - distance)
    const upper_y = Math.min(battle_grid.size.y - 1, position.y + footprint + distance - 1)

    const result: Array<PositionFootprintOne> = [];

    for (let x = lower_x; x <= upper_x; x++)
        for (let y = lower_y; y <= upper_y; y++) {
            const p: PositionFootprintOne = {x, y, footprint: 1}
            if (!positions_share_surface(position, p))
                result.push(p);
        }
    return result
}
