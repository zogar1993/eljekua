import {Position} from "battlegrid/Position";
import {BattleGrid} from "battlegrid/BattleGrid";
import {get_positions_within_distance} from "battlegrid/ranges/get_positions_within_distance";

export const get_reach_adjacent = ({battle_grid, position}: {
    position: Position,
    battle_grid: BattleGrid
}): Array<Position> => {
    return get_positions_within_distance({battle_grid, position, distance: 1})
}
