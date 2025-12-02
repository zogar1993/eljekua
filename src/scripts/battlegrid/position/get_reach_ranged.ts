import type {Position} from "scripts/battlegrid/Position";
import type {BattleGrid} from "scripts/battlegrid/BattleGrid";
import {get_positions_within_distance} from "scripts/battlegrid/position/get_positions_within_distance";

export const get_reach_ranged = ({origin, distance, battle_grid}: {
    origin: Position,
    distance: number,
    battle_grid: BattleGrid
}): Array<Position> => {
    return get_positions_within_distance({position: origin, distance, battle_grid})
}