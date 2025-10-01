import type {Position} from "battlegrid/Position";
import type {BattleGrid} from "battlegrid/BattleGrid";

export const get_melee = ({origin, battle_grid}: { origin: Position, battle_grid: BattleGrid }): Array<Position> => {
    const distance = 1
    const lower_x = Math.max(0, origin.x - distance)
    const upper_x = Math.min(battle_grid.BOARD_WIDTH - 1, origin.x + distance)
    const lower_y = Math.max(0, origin.y - distance)
    const upper_y = Math.min(battle_grid.BOARD_HEIGHT - 1, origin.y + distance)

    const result = [];
    for (let x = lower_x; x <= upper_x; x++)
        for (let y = lower_y; y <= upper_y; y++)
            if (origin.x !== x || origin.y !== y)
                result.push({x, y});
    return result
}