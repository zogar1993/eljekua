import type {Position} from "battlegrid/Position";
import type {BattleGrid} from "battlegrid/BattleGrid";
import {get_reach_ranged} from "battlegrid/ranges/get_reach_ranged";

export const get_reach_area_burst = ({origin, distance, battle_grid}: {
    origin: Position,
    distance: number,
    battle_grid: BattleGrid
}): Array<Position> => {
    return [origin, ...get_reach_ranged({origin, distance, battle_grid})]
}