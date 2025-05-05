import {BattleGrid, Creature, Position, Square} from "BattleGrid";
import {Power} from "types";
import {VisualSquareCreator} from "visuals/VisualSquare";
import {VisualCreatureCreator} from "visuals/VisualCreature";
import {BASIC_MOVEMENT_ACTIONS} from "./powers/basic";


const visual_square_creator = new VisualSquareCreator()
const visual_creature_creator = new VisualCreatureCreator()


const board = new BattleGrid({visual_square_creator, visual_creature_creator})


class PlayerControl {
    private selected: null | Creature = null

    selectCreature(creature: Creature) {
        this.selected = creature
        const cell = board.get_square(creature.position)
        cell.visual.setIndicator("selected")
        build_actions_menu()
    }

    deselectCreature() {
        const square = board.get_square(this.getSelectedCharacter().position)
        square.visual.clearIndicator()
        this.selected = null

        this.available_targets.forEach(cell => cell.visual.clearIndicator())
        this.available_targets.length = 0
    }

    addAvailableTarget(square: Square) {
        square.visual.setIndicator("available-target")
        this.available_targets.push(square)
    }

    available_targets: Array<Square> = []

    isAvailableTarget = (position: Position) => this.available_targets
        .some(({position: {x, y}}) => position.x === x && position.y === y)

    hasSelectedCharacter = () => !!this.selected
    getSelectedCharacter = () => {
        if (this.selected === null) throw Error("Character cannot be null")
        return this.selected
    }
}

const player_control = new PlayerControl()

visual_square_creator.addOnSquareClickEvent(({position}) => {
    if (player_control.hasSelectedCharacter()) {
        if (player_control.isAvailableTarget(position))
            move_character(position)
    } else {
        if (board.is_terrain_occupied(position)) {
            const creature = board.get_creature_by_position(position)
            player_control.selectCreature(creature)
        }
    }
})


const get_in_range = (range: Power["targeting"]) => {
    if (range.type === "movement") {
        const distance = new IntFormula(`${range.distance}`).func()
        return board.get_move_area({origin: player_control.getSelectedCharacter().position, distance})
    }

    throw `Range "${range.type}" not supported`
}

const filter_targets = ({target, position}: { target: Power["targeting"], position: Position }) => {
    if (target.target_type === "terrain")
        return !board.is_terrain_occupied(position)
    throw `Target "${target.type}" not supported`
}

function move_character(position: Position) {
    if (!player_control.hasSelectedCharacter()) throw Error("Character cannot be null")
    const creature = player_control.getSelectedCharacter()
    player_control.deselectCreature()

    board.place_character({creature, position})
}

function clear_actions_menu() {
    const buttons = document.querySelectorAll("#actions_menu > button")
    buttons.forEach(button => button.remove())
}

const player = {position: {x: 1, y: 2}, image: "blue", movement: 5, hp: 7, max_hp: 10}
const enemy = {position: {x: 5, y: 5}, image: "orange", movement: 2, hp: 10, max_hp: 10}

board.create_creature(player)
board.create_creature(enemy)

class IntFormula {
    raw: string
    offset = 0
    func: () => number

    constructor(raw: string) {
        this.raw = raw
        this.func = this.parse_expression()
    }

    owner() {
        return player_control.getSelectedCharacter()
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
        return () => creature().movement
    }

    is_not_end() {
        return this.offset < this.raw.length
    }
}


function build_actions_menu() {
    const cancel = document.createElement("button");
    cancel.addEventListener("click", () => {
        player_control.deselectCreature()
        clear_actions_menu()
    })
    cancel.innerText = "Cancel"

    const buttons = BASIC_MOVEMENT_ACTIONS.map(build_action_button)

    const actions_menu = document.querySelector("#actions_menu")!
    buttons.forEach(button => actions_menu.appendChild(button))
    actions_menu.appendChild(cancel)
}

function build_action_button(action: Power) {
    const button = document.createElement("button");
    button.addEventListener("click", () => {
        [...get_in_range(action.targeting)].filter(cell => filter_targets({
            target: action.targeting,
            position: cell.position
        })).forEach(cell => {
            player_control.addAvailableTarget(cell)
        })
        clear_actions_menu()
    })
    button.innerText = action.name
    return button
}
