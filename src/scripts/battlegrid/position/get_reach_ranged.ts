import type {Position, PositionFootprintOne} from "scripts/battlegrid/Position";
import type {BattleGrid} from "scripts/battlegrid/BattleGrid";
import {get_f1_positions_within_distance} from "scripts/battlegrid/position/get_f1_positions_within_distance";

export const get_reach_ranged = ({origin, distance, battle_grid}: {
    origin: Position,
    distance: number,
    battle_grid: BattleGrid
}): Array<PositionFootprintOne> => {
    return get_f1_positions_within_distance({position: origin, distance, battle_grid})
}