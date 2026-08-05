import {CreatureData} from "scripts/battlegrid/creatures/CreatureData";
import {InitiativeOrder} from "scripts/initiative_order/InitiativeOrder";
import {BattleGrid} from "scripts/battlegrid/BattleGrid";
import {roll_d} from "scripts/randomness/dice";
import {GameEvents} from "scripts/events/GameEvents";


export const create_add_creature_to_game = ({
                                                battle_grid,
                                                initiative_order,
                                                game_events
                                            }: {
                                                battle_grid: BattleGrid,
                                                initiative_order: InitiativeOrder,
                                                game_events: GameEvents
                                            }
) => (
    {data}: { data: CreatureData }
) => {
    const creature = battle_grid.create_creature(data)

    game_events.on_creature_added_to_game.raise(creature)

    initiative_order.add_entry({creature, initiative: roll_d(20)})
}