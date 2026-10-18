import type {Position} from "core/battlegrid/Position";
import type {BattleGrid} from "core/battlegrid/BattleGrid";
import {can_move_between} from "core/battlegrid/can_move_between";
import {get_positions_within_distance} from "core/battlegrid/position/get_positions_within_distance";

export const get_reach_adjacent = ({battle_grid, origin}: {
    origin: Position,
    battle_grid: BattleGrid
}): Array<Position> => {
    const candidates = get_positions_within_distance({battle_grid, origin, distance: 1})
    if (origin.footprint !== 1) return candidates
    return candidates.filter(position => can_move_between(battle_grid, origin, position))
}