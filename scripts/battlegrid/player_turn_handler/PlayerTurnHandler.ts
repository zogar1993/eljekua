import {BattleGrid, Creature, Square} from "../BattleGrid";
import {Position} from "../Position";
import {BASIC_ATTACK_ACTIONS, BASIC_MOVEMENT_ACTIONS} from "../../powers/basic";
import {Power} from "../../types";


export class PlayerTurnHandler {
    private battle_grid: BattleGrid
    private available_targets: AvailableTargets | null = null
    private selected: null | Creature = null

    constructor(battle_grid: BattleGrid) {
        this.battle_grid = battle_grid
    }

    select(creature: Creature) {
        this.selected = creature
        const cell = this.battle_grid.get_square(creature.position)
        cell.visual.setIndicator("selected")
        this.build_actions_menu()
    }

    target(position: Position) {
        if (this.available_targets === null) throw Error("available targets are not set")
        this.available_targets?.onClick(position)
    }

    deselect() {
        const square = this.battle_grid.get_square(this.get_selected_creature().position)
        square.visual.clearIndicator()
        this.selected = null

        this.available_targets?.destroy()
    }

    set_available_targets({squares, onClick}: { squares: Array<Square>, onClick: (position: Position) => void }) {
        this.available_targets = new AvailableTargets({
            squares,
            onClick,
            onDestroy: () => this.available_targets = null
        })
    }


    is_available_target = (position: Position) => {
        if (this.available_targets === null) throw Error("available targets are not set")
        return this.available_targets.contains(position)
    }

    has_selected_creature = () => !!this.selected
    get_selected_creature = () => {
        if (this.selected === null) throw Error("Character cannot be null")
        return this.selected
    }


    build_actions_menu() {
        const cancel = document.createElement("button");
        cancel.addEventListener("click", () => {
            this.deselect()
            this.clear_actions_menu()
        })
        cancel.innerText = "Cancel"

        const movement_action_buttons = BASIC_MOVEMENT_ACTIONS.map(power => this.build_action_button(power))
        const basic_attack_actions = BASIC_ATTACK_ACTIONS.map(power => this.build_action_button(power))

        const actions_menu = document.querySelector("#actions_menu")!
        movement_action_buttons.forEach(button => actions_menu.appendChild(button))
        basic_attack_actions.forEach(button => actions_menu.appendChild(button))
        actions_menu.appendChild(cancel)
    }

    clear_actions_menu() {
        const buttons = document.querySelectorAll("#actions_menu > button")
        buttons.forEach(button => button.remove())
    }


    get_in_range({targeting, origin}: { targeting: Power["targeting"], origin: Position }) {
        if (targeting.type === "movement") {
            const distance = new IntFormula(`${targeting.distance}`, this).func()
            return this.battle_grid.get_move_area({origin, distance})
        } else if (targeting.type === "melee") {
            return this.battle_grid.get_melee({origin})
        }

        throw `Range "${targeting.type}" not supported`
    }

    filter_targets({targeting, position}: { targeting: Power["targeting"], position: Position }) {
        if (targeting.target_type === "terrain")
            return !this.battle_grid.is_terrain_occupied(position)
        if (targeting.target_type === "enemy")
            return this.battle_grid.is_terrain_occupied(position)

        throw `Target "${targeting.type}" not supported`
    }

    build_action_button(action: Power) {
        const button = document.createElement("button");

        const valid_targets = [...this.get_in_range({
            targeting: action.targeting,
            origin: this.get_selected_creature().position
        })]
            .filter(square => this.filter_targets({
                targeting: action.targeting,
                position: square.position
            }))

        if (valid_targets.length === 0)
            button.setAttribute("disabled", "")

        button.addEventListener("click", () => {
            const onClick = (position: Position) => {
                action.happenings.forEach(happening => {
                    if (["move", "shift"].includes(happening.type)) {
                        const creature = this.get_selected_creature()
                        this.deselect()

                        this.battle_grid.place_character({creature, position})
                    } else if ("apply_damage" === happening.type) {
                        const creature = this.get_selected_creature()
                        this.deselect()

                        const target = this.battle_grid.get_creature_by_position(position)
                        target.receive_damage(Number(happening.value))
                    } else {
                        throw Error("action not implemented " + happening.type)
                    }
                })
            }
            this.set_available_targets({squares: valid_targets, onClick})

            this.clear_actions_menu()
        })
        button.innerText = action.name
        return button
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


class IntFormula {
    raw: string
    offset = 0
    func: () => number
    player_control: PlayerTurnHandler

    constructor(raw: string, player_control: PlayerTurnHandler) {
        this.raw = raw
        this.func = this.parse_expression()
        this.player_control = player_control
    }

    owner() {
        return this.player_control.get_selected_creature()
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
            return this.parse_creature_characteristic(() => this.owner())
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