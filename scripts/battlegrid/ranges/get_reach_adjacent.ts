import {Position} from "battlegrid/Position";
import {BattleGrid} from "battlegrid/BattleGrid";


export const get_reach_adjacent = ({battle_grid, position}: { position: Position, battle_grid: BattleGrid }) => {
    const distance = 1
    const lower_x = Math.max(0, position.x - distance)
    const upper_x = Math.min(battle_grid.BOARD_WIDTH - 1, position.x + distance)
    const lower_y = Math.max(0, position.y - distance)
    const upper_y = Math.min(battle_grid.BOARD_HEIGHT - 1, position.y + distance)

    const result = [];
    for (let x = lower_x; x <= upper_x; x++)
        for (let y = lower_y; y <= upper_y; y++)
            if (position.x !== x || position.y !== y)
                result.push({x, y});
    return result
}