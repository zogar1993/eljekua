import {CreatureData} from "scripts/battlegrid/creatures/CreatureData";
import {InitiativeOrder} from "scripts/initiative_order/InitiativeOrder";
import {BattleGrid} from "scripts/battlegrid/BattleGrid";
import {roll_d} from "scripts/randomness/dice";


export const create_add_creature_to_game = (
    {battle_grid, initiative_order}: { battle_grid: BattleGrid, initiative_order: InitiativeOrder }
) => (
    {data}: { data: CreatureData }
) => {
    const creature = battle_grid.create_creature(data)
    initiative_order.add_entry({creature, initiative: roll_d(20)})
}