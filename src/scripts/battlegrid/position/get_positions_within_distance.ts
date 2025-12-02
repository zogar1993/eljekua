import type {Position} from "scripts/battlegrid/Position";
import type {BattleGrid} from "scripts/battlegrid/BattleGrid";

export const get_positions_within_distance = ({battle_grid, position, distance}: {
    position: Position,
    battle_grid: BattleGrid,
    distance: number
}): Array<Position> => {
    const footprint = position.footprint
    const lower_x = Math.max(0, position.x - distance)
    const upper_x = Math.min(battle_grid.size.x - footprint, position.x + distance)
    const lower_y = Math.max(0, position.y - distance)
    const upper_y = Math.min(battle_grid.size.y - footprint, position.y + distance)

    const result: Array<Position> = [];
    for (let x = lower_x; x <= upper_x; x++)
        for (let y = lower_y; y <= upper_y; y++)
            if (position.x !== x || position.y !== y)
                result.push({x, y, footprint});
    return result
}
