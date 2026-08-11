import type {Position} from "core/battlegrid/Position";
import type {BattleGrid} from "core/battlegrid/BattleGrid";
import {get_f1_positions_within_distance} from "core/battlegrid/position/get_f1_positions_within_distance";

export const get_reach_melee = ({origin, battle_grid}: { origin: Position, battle_grid: BattleGrid }): Array<Position> => {
    return get_f1_positions_within_distance({position: origin, distance: 1, battle_grid})
}