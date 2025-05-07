import {BattleGrid} from "battlegrid/BattleGrid";
import {VisualSquareCreator} from "battlegrid/squares/SquareVisual";
import {VisualCreatureCreator} from "battlegrid/creatures/CreatureVisual";
import {PlayerTurnHandler} from "./battlegrid/player_turn_handler/PlayerTurnHandler";


const visual_square_creator = new VisualSquareCreator()
const visual_creature_creator = new VisualCreatureCreator()
const battle_grid = new BattleGrid({visual_square_creator, visual_creature_creator})
const player_control = new PlayerTurnHandler(battle_grid)

visual_square_creator.addOnSquareClickEvent(({position}) => {
    if (player_control.has_selected_creature()) {
        if (player_control.is_available_target(position))
            player_control.target(position)
    } else {
        if (battle_grid.is_terrain_occupied(position)) {
            const creature = battle_grid.get_creature_by_position(position)
            player_control.select(creature)
        }
    }
})

const bob = {position: {x: 1, y: 2}, image: `url("/public/mech.webp")`, movement: 5, hp: 7, max_hp: 10}
const maik = {position: {x: 2, y: 5}, image: `url("/public/mech.webp")`, movement: 2, hp: 10, max_hp: 10}

battle_grid.create_creature(bob)
battle_grid.create_creature(maik)

const ATTRIBUTES = {
    STRENGTH: "str",
    CONSTITUTION: "con",
    DEXTERITY: "dex",
    INTELLIGENCE: "int",
    WISDOM: "wis",
    CHARISMA: "cha",
} as const

type Attribute = typeof ATTRIBUTES[keyof typeof ATTRIBUTES]
