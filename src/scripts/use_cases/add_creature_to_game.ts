import {CreatureData} from "scripts/battlegrid/creatures/CreatureData";
import {InitiativeOrder} from "scripts/initiative_order/InitiativeOrder";
import {BattleGrid} from "scripts/battlegrid/BattleGrid";
import {roll_d} from "scripts/randomness/dice";
import {Creature} from "scripts/battlegrid/creatures/Creature";


export const create_add_creature_to_game = ({
                                                battle_grid,
                                                initiative_order,
                                                on_creature_added_to_game
                                            }: {
                                                battle_grid: BattleGrid,
                                                initiative_order: InitiativeOrder,
                                                on_creature_added_to_game: Array<(creature: Creature) => void>
                                            }
) => (
    {data}: { data: CreatureData }
) => {
    const creature = battle_grid.create_creature(data)

    on_creature_added_to_game.forEach(handler => handler(creature))

    initiative_order.add_entry({creature, initiative: roll_d(20)})
}