import {Position} from "scripts/battlegrid/Position";
import {BattleGrid} from "scripts/battlegrid/BattleGrid";
import {get_positions_within_distance} from "scripts/battlegrid/position/get_positions_within_distance";

export const get_reach_adjacent = ({battle_grid, position}: {
    position: Position,
    battle_grid: BattleGrid
}): Array<Position> => {
    return get_positions_within_distance({battle_grid, position, distance: 1})
}
