import type {Position} from "scripts/battlegrid/Position";
import type {BattleGrid} from "scripts/battlegrid/BattleGrid";

export const get_positions_within_distance = ({battle_grid, origin, distance}: {
    origin: Position,
    battle_grid: BattleGrid,
    distance: number
}): Array<Position> => {
    const footprint = origin.footprint
    const lower_x = Math.max(0, origin.x - distance)
    const upper_x = Math.min(battle_grid.size.x - footprint, origin.x + distance)
    const lower_y = Math.max(0, origin.y - distance)
    const upper_y = Math.min(battle_grid.size.y - footprint, origin.y + distance)

    const result: Array<Position> = [];
    for (let x = lower_x; x <= upper_x; x++)
        for (let y = lower_y; y <= upper_y; y++)
            if (origin.x !== x || origin.y !== y)
                result.push({x, y, footprint});
    return result
}