import type {Position, PositionFootprintOne} from "core/battlegrid/Position";
import type {BattleGrid} from "core/battlegrid/BattleGrid";
import {get_f1_positions_within_distance} from "core/battlegrid/position/get_f1_positions_within_distance";

export const get_reach_ranged = ({origin, distance, battle_grid}: {
    origin: Position,
    distance: number,
    battle_grid: BattleGrid
}): Array<PositionFootprintOne> => {
    return get_f1_positions_within_distance({position: origin, distance, battle_grid})
}