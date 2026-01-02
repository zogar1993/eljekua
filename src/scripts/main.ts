import {create_battle_grid} from "scripts/battlegrid/BattleGrid";
import {create_visual_square} from "scripts/battlegrid/squares/SquareVisual";
import {create_visual_creature} from "scripts/battlegrid/creatures/CreatureVisual";
import {create_battle_grid_visual} from "scripts/battlegrid/BattleGridVisual";
import {create_player_turn_handler} from "scripts/battlegrid/player_turn_handler/PlayerTurnHandler";
import {ActionLog} from "scripts/action_log/ActionLog";
import {Creature} from "scripts/battlegrid/creatures/Creature";
import {ROGUE_POWERS} from "scripts/powers/rogue";
import {FIGHTER_POWERS} from "scripts/powers/fighter";
import {WIZARD_POWERS} from "scripts/powers/wizard";
import type {CreatureData} from "scripts/battlegrid/creatures/CreatureData";
import {InitiativeOrder} from "scripts/initiative_order/InitiativeOrder";
import {InitiativeOrderVisual} from "scripts/initiative_order/InitiativeOrderVisual";
import {create_option_buttons} from "scripts/battlegrid/OptionButtons";

const visual_initiative_order = new InitiativeOrderVisual()

const initiative_order = new InitiativeOrder(visual_initiative_order)
const action_log = new ActionLog()

const battle_grid = create_battle_grid({
    create_visual_square,
    create_visual_creature,
    create_battle_grid_visual,
    size: {x: 10, y: 10}
})

const option_buttons = create_option_buttons()

const player_turn_handler = create_player_turn_handler({battle_grid, action_log, initiative_order, option_buttons})

const ATTRIBUTES = {
        STRENGTH: "str",
        CONSTITUTION: "con",
        DEXTERITY: "dex",
        INTELLIGENCE: "int",
        WISDOM: "wis",
        CHARISMA: "cha",
    } as const

;(window as any).init_demo = () => {
    const bob = build_character({
        name: "Bob",
        position: {x: 1, y: 2, footprint: 1},
        image: `url("/public/war-axe.svg")`,
        movement: 5,
        hp_current: 7,
        hp_max: 10,
        level: 20,
        attributes: Object.fromEntries(Object.values(ATTRIBUTES).map(attr => [attr, 14])) as Creature["data"]["attributes"],
        powers: FIGHTER_POWERS,
        team: 1
    })
    const maik = build_character({
        name: "Maik",
        position: {x: 0, y: 1, footprint: 1},
        image: `url("/public/wizard-staff.svg")`,
        movement: 2,
        hp_current: 10,
        hp_max: 10,
        level: 1,
        attributes: Object.fromEntries(Object.values(ATTRIBUTES).map(attr => [attr, 14])) as Creature["data"]["attributes"],
        powers: WIZARD_POWERS,
        team: 1
    })
    const yeims = build_character({
        name: "Yeims",
        position: {x: 1, y: 0, footprint: 1},
        image: `url("/public/crossbow.svg")`,
        movement: 10,
        hp_current: 10,
        hp_max: 10,
        level: 1,
        team: null,
        attributes: Object.fromEntries(Object.values(ATTRIBUTES).map(attr => [attr, 14])) as Creature["data"]["attributes"],
        powers: ROGUE_POWERS
    })

    const jenri = build_character({
        name: "Jenri",
        position: {x: 7, y: 7, footprint: 2},
        size: "large"
    })

    player_turn_handler.add_creature(bob)
    player_turn_handler.add_creature(maik)
    player_turn_handler.add_creature(yeims)
    player_turn_handler.add_creature(jenri)

    player_turn_handler.start()
}

;(window as any).add_character = (data: CreatureData) => {
    player_turn_handler.add_creature(data)
}

;(window as any).start = () => {
    player_turn_handler.start()
}

const build_character = (data:
                             Omit<Partial<CreatureData>, "position"> &
                             Pick<CreatureData, "name" | "position">): CreatureData => {
    return {
        name: data.name,
        position: data.position,
        size: data.size ?? "medium",
        image: data.image ?? `url("/public/saber-and-pistol.svg")`,
        movement: data.movement ?? 5,
        hp_current: data.hp_current ?? 10,
        hp_max: data.hp_max ?? 10,
        level: data.level ?? 1,
        team: data.team ?? null,
        attributes: data.attributes ?? Object.fromEntries(Object.values(ATTRIBUTES).map(attr => [attr, 14])) as Creature["data"]["attributes"],
        powers: data.powers ?? []
    }
}

battle_grid.visual.addOnMouseMoveHandler(coordinate => {
    player_turn_handler.on_hover({coordinate})
})

battle_grid.visual.addOnClickHandler(coordinate => {
    player_turn_handler.on_click({coordinate})
})

//TODO AP1 big fellows are not painted totally when targeted for attack
//TODO AP1 using a movement action can be used with a standard action