import type {Position} from "battlegrid/Position";
import type {BattleGrid} from "battlegrid/BattleGrid";
import {get_positions_within_distance} from "battlegrid/ranges/get_positions_within_distance";

export const get_reach_melee = ({origin, battle_grid}: { origin: Position, battle_grid: BattleGrid }): Array<Position> => {
    return get_positions_within_distance({position: origin, distance: 1, battle_grid})
}