import {BattleGrid} from "battlegrid/BattleGrid";
import {VisualSquareCreator} from "battlegrid/squares/SquareVisual";
import {VisualCreatureCreator} from "battlegrid/creatures/CreatureVisual";
import {PlayerTurnHandler} from "battlegrid/player_turn_handler/PlayerTurnHandler";
import {ActionLog} from "action_log/ActionLog";
import {Creature} from "battlegrid/creatures/Creature";
import {ROGUE_POWERS} from "powers/rogue";
import {FIGHTER_POWERS} from "powers/fighter";
import {WIZARD_POWERS} from "powers/wizard";

const visual_square_creator = new VisualSquareCreator()
const visual_creature_creator = new VisualCreatureCreator()
const action_log = new ActionLog()
const battle_grid = new BattleGrid({visual_square_creator, visual_creature_creator})
const player_turn_handler = new PlayerTurnHandler(battle_grid, action_log)

visual_creature_creator.addOnCreatureClickEvent(player_turn_handler.onClick)
visual_square_creator.addOnSquareClickEvent(player_turn_handler.onClick)

const ATTRIBUTES = {
    STRENGTH: "str",
    CONSTITUTION: "con",
    DEXTERITY: "dex",
    INTELLIGENCE: "int",
    WISDOM: "wis",
    CHARISMA: "cha",
} as const

const bob = {
    name: "Bob",
    position: {x: 1, y: 2},
    image: `url("/public/war-axe.svg")`,
    movement: 5,
    hp_current: 7,
    hp_max: 10,
    level: 2,
    attributes: Object.fromEntries(Object.values(ATTRIBUTES).map(attr => [attr, 14])) as Creature["data"]["attributes"],
    powers: FIGHTER_POWERS
}
const maik = {
    name: "Maik",
    position: {x: 2, y: 5},
    image: `url("/public/wizard-staff.svg")`,
    movement: 2,
    hp_current: 10,
    hp_max: 10,
    level: 1,
    attributes: Object.fromEntries(Object.values(ATTRIBUTES).map(attr => [attr, 14])) as Creature["data"]["attributes"],
    powers: WIZARD_POWERS
}
const yeims = {
    name: "Yeims",
    position: {x: 2, y: 6},
    image: `url("/public/crossbow.svg")`,
    movement: 2,
    hp_current: 10,
    hp_max: 10,
    level: 1,
    attributes: Object.fromEntries(Object.values(ATTRIBUTES).map(attr => [attr, 14])) as Creature["data"]["attributes"],
    powers: []
}

const jenri = {
    name: "Jenri",
    position: {x: 9, y: 2},
    image: `url("/public/saber-and-pistol.svg")`,
    movement: 2,
    hp_current: 10,
    hp_max: 10,
    level: 1,
    attributes: Object.fromEntries(Object.values(ATTRIBUTES).map(attr => [attr, 14])) as Creature["data"]["attributes"],
    powers: ROGUE_POWERS
}

battle_grid.create_creature(bob)
battle_grid.create_creature(maik)
battle_grid.create_creature(yeims)
battle_grid.create_creature(jenri)
