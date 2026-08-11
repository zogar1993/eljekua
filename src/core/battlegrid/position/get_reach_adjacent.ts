import {Position} from "core/battlegrid/Position";
import {BattleGrid} from "core/battlegrid/BattleGrid";
import {get_positions_within_distance} from "core/battlegrid/position/get_positions_within_distance";

export const get_reach_adjacent = ({battle_grid, origin}: {
    origin: Position,
    battle_grid: BattleGrid
}): Array<Position> => {
    return get_positions_within_distance({battle_grid, origin, distance: 1})
}