import type {PositionFootprintOne} from "scripts/battlegrid/Position";
import type {BattleGrid} from "scripts/battlegrid/BattleGrid";
import {get_reach_ranged} from "scripts/battlegrid/position/get_reach_ranged";

export const get_reach_area_burst = ({origin, distance, battle_grid}: {
    origin: PositionFootprintOne,
    distance: number,
    battle_grid: BattleGrid
}): Array<PositionFootprintOne> => {
    return [origin, ...get_reach_ranged({origin, distance, battle_grid})]
}