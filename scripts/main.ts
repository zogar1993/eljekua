import {BattleGrid, Creature, Square} from "battlegrid/BattleGrid";
import {Power} from "types";
import {VisualSquareCreator} from "battlegrid/board/SquareVisual";
import {VisualCreatureCreator} from "battlegrid/creatures/CreatureVisual";
import {BASIC_ATTACK_ACTIONS, BASIC_MOVEMENT_ACTIONS} from "./powers/basic";
import {Position} from "./battlegrid/Position";


const visual_square_creator = new VisualSquareCreator()
const visual_creature_creator = new VisualCreatureCreator()
const board = new BattleGrid({visual_square_creator, visual_creature_creator})

class PlayerControl {
    private available_targets: AvailableTargets | null = null
    private selected: null | Creature = null

    select(creature: Creature) {
        this.selected = creature
        const cell = board.get_square(creature.position)
        cell.visual.setIndicator("selected")
        build_actions_menu()
    }

    target(position: Position) {
        if (this.available_targets === null) throw Error("available targets are not set")
        this.available_targets?.onClick(position)
    }

    deselect() {
        const square = board.get_square(this.getSelectedCreature().position)
        square.visual.clearIndicator()
        this.selected = null

        this.available_targets?.destroy()
    }

    setAvailableTargets({squares, onClick}: { squares: Array<Square>, onClick: (position: Position) => void }) {
        this.available_targets = new AvailableTargets({
            squares,
            onClick,
            onDestroy: () => this.available_targets = null
        })
    }


    isAvailableTarget = (position: Position) => {
        if (this.available_targets === null) throw Error("available targets are not set")
        return this.available_targets.contains(position)
    }

    hasSelectedCreature = () => !!this.selected
    getSelectedCreature = () => {
        if (this.selected === null) throw Error("Character cannot be null")
        return this.selected
    }
}

class AvailableTargets {
    onClick: (position: Position) => void
    onDestroy: () => void
    squares: Array<Square> = []

    constructor({squares, onClick, onDestroy}: {
        squares: Array<Square>,
        onClick: (position: Position) => void,
        onDestroy: () => void
    }) {
        this.squares = squares
        this.onClick = onClick
        this.onDestroy = onDestroy
        this.squares.forEach(({visual}) => visual.setIndicator("available-target"))
    }

    destroy() {
        this.squares.forEach(square => square.visual.clearIndicator())
        this.onDestroy()
    }

    contains(position: Position) {
        return this.squares.some(({position: {x, y}}) => position.x === x && position.y === y)
    }
}

const player_control = new PlayerControl()

visual_square_creator.addOnSquareClickEvent(({position}) => {
    if (player_control.hasSelectedCreature()) {
        if (player_control.isAvailableTarget(position))
            player_control.target(position)
    } else {
        if (board.is_terrain_occupied(position)) {
            const creature = board.get_creature_by_position(position)
            player_control.select(creature)
        }
    }
})

const get_in_range = (range: Power["targeting"]) => {
    if (range.type === "movement") {
        const distance = new IntFormula(`${range.distance}`).func()
        return board.get_move_area({origin: player_control.getSelectedCreature().position, distance})
    } else if (range.type === "melee") {
        return board.get_melee({origin: player_control.getSelectedCreature().position})
    }

    throw `Range "${range.type}" not supported`
}

const filter_targets = ({targeting, position}: { targeting: Power["targeting"], position: Position }) => {
    if (targeting.target_type === "terrain")
        return !board.is_terrain_occupied(position)
    if (targeting.target_type === "enemy")
        return board.is_terrain_occupied(position)

    throw `Target "${targeting.type}" not supported`
}

function clear_actions_menu() {
    const buttons = document.querySelectorAll("#actions_menu > button")
    buttons.forEach(button => button.remove())
}

class IntFormula {
    raw: string
    offset = 0
    func: () => number

    constructor(raw: string) {
        this.raw = raw
        this.func = this.parse_expression()
    }

    owner() {
        return player_control.getSelectedCreature()
    }

    parse_expression() {
        return this.parse_until_end_or(".")
    }

    parse_until_end_or(delimiter: string) {
        const remaining = this.raw.substring(this.offset)
        const i = remaining.indexOf(delimiter)
        if (i === -1) {
            this.offset = this.raw.length
            return () => Number(remaining)
        } else if (delimiter === ".") {
            const object_name = this.raw.substring(this.offset, i)
            if (object_name !== "owner") throw Error(`Can't parse "${delimiter}"`)
            this.offset = i + 1
            return this.parse_creature_characteristic(this.owner)
        } else {
            throw Error(`Can't parse "${delimiter}"`)
        }
    }

    parse_creature_characteristic(creature: () => Creature) {
        const remaining = this.raw.substring(this.offset)
        if (remaining !== "movement") throw Error(`Can't parse "${remaining}"`)
        return () => creature().data.movement
    }

    is_not_end() {
        return this.offset < this.raw.length
    }
}

function build_actions_menu() {
    const cancel = document.createElement("button");
    cancel.addEventListener("click", () => {
        player_control.deselect()
        clear_actions_menu()
    })
    cancel.innerText = "Cancel"

    const movement_action_buttons = BASIC_MOVEMENT_ACTIONS.map(build_action_button)
    const basic_attack_actions = BASIC_ATTACK_ACTIONS.map(build_action_button)

    const actions_menu = document.querySelector("#actions_menu")!
    movement_action_buttons.forEach(button => actions_menu.appendChild(button))
    basic_attack_actions.forEach(button => actions_menu.appendChild(button))
    actions_menu.appendChild(cancel)
}

function build_action_button(action: Power) {
    const button = document.createElement("button");

    const valid_targets = [...get_in_range(action.targeting)]
        .filter(square => filter_targets({
            targeting: action.targeting,
            position: square.position
        }))

    if (valid_targets.length === 0)
        button.setAttribute("disabled", "")

    button.addEventListener("click", () => {
        const onClick = (position: Position) => {
            action.happenings.forEach(happening => {
                if (["move", "shift"].includes(happening.type)) {
                    const creature = player_control.getSelectedCreature()
                    player_control.deselect()

                    board.place_character({creature, position})
                } else if ("apply_damage" === happening.type) {
                    const creature = player_control.getSelectedCreature()
                    player_control.deselect()

                    const target = board.get_creature_by_position(position)
                    target.receive_damage(Number(happening.value))
                } else {
                    throw Error("action not implemented " + happening.type)
                }
            })
        }
        player_control.setAvailableTargets({squares: valid_targets, onClick})


        clear_actions_menu()
    })
    button.innerText = action.name
    return button
}


const bob = {position: {x: 1, y: 2}, image: "blue", movement: 5, hp: 7, max_hp: 10}
const maik = {position: {x: 2, y: 5}, image: "orange", movement: 2, hp: 10, max_hp: 10}

board.create_creature(bob)
board.create_creature(maik)

const ATTRIBUTES = {
    STRENGTH: "str",
    CONSTITUTION: "con",
    DEXTERITY: "dex",
    INTELLIGENCE: "int",
    WISDOM: "wis",
    CHARISMA: "cha",
} as const

type Attribute = typeof ATTRIBUTES[keyof typeof ATTRIBUTES]

class CharacterSheet {
    private attributes: Record<Attribute, number> = {
        str: 10,
        con: 10,
        dex: 10,
        int: 10,
        wis: 10,
        cha: 10
    }

    getAttributeMod(attribute: Attribute) {
        return Math.floor((this.attributes[attribute] - 10) / 2)
    }
}