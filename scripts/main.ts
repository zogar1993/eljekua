import {BattleGrid, ClickableCoordinate} from "battlegrid/BattleGrid";
import {VisualSquareCreator} from "battlegrid/squares/SquareVisual";
import {VisualCreatureCreator} from "battlegrid/creatures/CreatureVisual";
import {PlayerTurnHandler} from "battlegrid/player_turn_handler/PlayerTurnHandler";
import {ActionLog} from "action_log/ActionLog";
import {Creature} from "battlegrid/creatures/Creature";
import {ROGUE_POWERS} from "powers/rogue";
import {FIGHTER_POWERS} from "powers/fighter";
import {WIZARD_POWERS} from "powers/wizard";
import type {CreatureData} from "battlegrid/creatures/CreatureData";
import {InitiativeOrder} from "initiative_order/InitiativeOrder";
import {InitiativeOrderVisual} from "initiative_order/InitiativeOrderVisual";

const visual_square_creator = new VisualSquareCreator()
const visual_creature_creator = new VisualCreatureCreator()
const visual_initiative_order = new InitiativeOrderVisual()

const initiative_order = new InitiativeOrder(visual_initiative_order)
const action_log = new ActionLog()
const battle_grid = new BattleGrid({visual_square_creator, visual_creature_creator})
const player_turn_handler = new PlayerTurnHandler({battle_grid, action_log, initiative_order})

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
        position: {x: 8, y: 8, footprint: 2},
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

const transform_clickable_coordinate_into_position = ({coordinate, footprint}: {
    coordinate: ClickableCoordinate,
    footprint: number
}) => {
    const raw_x = Math.floor((coordinate.x - footprint + 1) / 2)
    const x = Math.min(Math.max(0, raw_x), battle_grid.BOARD_WIDTH - footprint)
    const raw_y = Math.floor((coordinate.y - footprint + 1) / 2)
    const y = Math.min(Math.max(0, raw_y), battle_grid.BOARD_HEIGHT - footprint)
    return {x, y, footprint}
}

battle_grid.addOnMouseMoveHandler(coordinate => {
    if (player_turn_handler.selection_context?.type !== "position_select") return
    const footprint = player_turn_handler.selection_context.footprint
    const position = transform_clickable_coordinate_into_position({coordinate, footprint})
    player_turn_handler.on_hover({position})
})

battle_grid.addOnClickHandler(coordinate => {
    if (player_turn_handler.selection_context?.type !== "position_select") return
    const footprint = player_turn_handler.selection_context.footprint
    const position = transform_clickable_coordinate_into_position({coordinate, footprint})
    player_turn_handler.on_click({position})
})
