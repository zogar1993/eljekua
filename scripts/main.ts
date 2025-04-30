import {Board, Cell, Position} from "board";
import {BASIC_MOVEMENT_ACTIONS} from "powers/basic";
import {Power} from "types";

const board = new Board()

board.get_all_cells().forEach(cell =>
    cell.html_element.addEventListener("click", () => {
        if (selected_character === null) {
            if (cell.character)
                select_character(cell)
        } else {
            if (cell.html_element.dataset["indicator"] === "available-target")
                move_character(cell)
        }
    })
)


const get_in_range = (range: Power["targeting"]) => {
    if (selected_character === null) throw Error("Character cannot be null")
    if (range.type === "movement") {
        const distance = "owner.movement" === range.distance ? selected_character.movement : Number(range.distance)
        return board.get_move_area({origin: selected_character.position, distance})
    }

    throw `Range "${range.type}" not supported`
}

const filter_targets = ({target, cell}: { target: Power["targeting"], cell: Cell }) => {
    if (target.target_type === "terrain")
        return !cell.character
    throw `Target "${target.type}" not supported`
}

function build_action_button(action: Power) {
    const button = document.createElement("button");
    button.addEventListener("click", () => {
        [...get_in_range(action.targeting)].filter(cell => filter_targets({
            target: action.targeting,
            cell
        })).forEach(cell => {
            cell.html_element.dataset["indicator"] = "available-target"
        })
        clear_actions_menu()
    })
    button.innerText = action.name
    return button
}

function build_actions_menu() {
    const cancel = document.createElement("button");
    cancel.addEventListener("click", () => {
        selected_character = null
        board.clear_indicators()
        clear_actions_menu()
    })
    cancel.innerText = "Cancel"

    const buttons = BASIC_MOVEMENT_ACTIONS.map(build_action_button)

    const actions_menu = document.querySelector("#actions_menu")!
    buttons.forEach(button => actions_menu.appendChild(button))

    actions_menu.appendChild(cancel)
}

function select_character(cell: Cell) {
    selected_character = cell.character
    cell.html_element.dataset["indicator"] = "selected"
    build_actions_menu()
}

function move_character(cell: Cell) {
    if (selected_character === null) throw Error("Character cannot be null")

    const old_position = board.get_cell(selected_character.position)
    old_position.character = null

    cell.character = selected_character
    selected_character.position = cell.position

    const html_creature = selected_character.html_creature
    if (html_creature === undefined) throw Error("selected_character.html_creature cannot be null")
    html_creature.style.setProperty("--creature_position-x", `${selected_character.position.x}`)
    html_creature.style.setProperty("--creature_position-y", `${selected_character.position.y}`)

    selected_character = null
    board.clear_indicators()
}

let selected_character: Creature | null = null

function clear_actions_menu() {
    const buttons = document.querySelectorAll("#actions_menu > button")
    buttons.forEach(button => button.remove())
}


function place_character(creature: Creature) {
    const cell = board.get_cell(creature.position)
    cell.character = creature

    const html_creature = document.createElement("div")
    html_creature.style.setProperty("--creature__image_color", creature.image)
    html_creature.classList.add("creature")
    html_creature.style.setProperty("--creature_position-x", `${creature.position.x}`)
    html_creature.style.setProperty("--creature_position-y", `${creature.position.y}`)
    html_creature.style.setProperty("--creature__lifebar_max-hp", `${creature.max_hp}`)
    html_creature.style.setProperty("--creature__lifebar_current-hp", `${creature.hp}`)

    const html_sprite = document.createElement("div")
    html_sprite.style.setProperty("--creature__image_color", creature.image)
    html_sprite.classList.add("creature__image")
    html_creature.appendChild(html_sprite)

    const html_lifebar = document.createElement("div")
    html_lifebar.classList.add("creature__lifebar")
    html_creature.appendChild(html_lifebar)

    const html_creatures = document.getElementById("creatures")!
    html_creatures.appendChild(html_creature)
    creature.html_creature = html_creature
}

const player = {position: {x: 1, y: 2}, image: "blue", movement: 5, hp: 7, max_hp: 10}
const enemy = {position: {x: 5, y: 5}, image: "orange", movement: 2, hp: 10, max_hp: 10}

place_character(player)
place_character(enemy)

type Creature = {
    position: Position
    image: string
    movement: number
    hp: number
    max_hp: number
    html_creature?: HTMLDivElement
}