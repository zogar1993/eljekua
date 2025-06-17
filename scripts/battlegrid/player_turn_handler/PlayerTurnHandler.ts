import {BattleGrid, Creature, Square} from "battlegrid/BattleGrid";
import {Position} from "battlegrid/Position";
import {BASIC_ATTACK_ACTIONS, BASIC_MOVEMENT_ACTIONS} from "powers/basic";
import {Power} from "types";
import {KeywordToken, Token} from "formulas/tokenize";
import {assert} from "assert";

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
            const distance = new IntFormulaFromTokens(targeting.distance, this).get_resolved_number_values()
            return this.battle_grid.get_move_area({
                origin,
                distance: add_all_resolved_number_values(distance)
            })
        } else if (targeting.type === "melee") {
            return this.battle_grid.get_melee({origin})
        }

        throw `Range "${targeting}" not supported`
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

        /*
                const action_preview = document.querySelector("#action_preview")!
                button.addEventListener("mouseenter", () => {
                    action_preview.textContent = ""
                })
         */

        if (valid_targets.length === 0)
            button.setAttribute("disabled", "")

        button.addEventListener("click", () => {
            const onClick = (position: Position) => {
                if (action.hit) {
                    action.hit.forEach(consequence => {
                        if (["move", "shift"].includes(consequence.type)) {
                            const creature = this.get_selected_creature()
                            this.deselect()

                            this.battle_grid.place_character({creature, position})
                        } else if ("apply_damage" === consequence.type) {
                            const creature = this.get_selected_creature()
                            this.deselect()

                            const target = this.battle_grid.get_creature_by_position(position)
                            const resolved = resolve_all_unresolved_number_values(new IntFormulaFromTokens(consequence.value, this).get_all_number_values())
                            target.receive_damage(add_all_resolved_number_values(resolved))
                        } else {
                            throw Error("action not implemented " + consequence.type)
                        }
                    })
                }
                if (action.effect)
                    action.effect.forEach(consequence => {
                        if (["move", "shift"].includes(consequence.type)) {
                            const creature = this.get_selected_creature()
                            this.deselect()

                            this.battle_grid.place_character({creature, position})
                        } else {
                            throw Error("action not implemented " + consequence.type)
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

class IntFormulaFromTokens {
    private readonly player_control: PlayerTurnHandler
    private readonly number_values: Array<NumberValue>

    constructor(tokens: Array<Token>, player_control: PlayerTurnHandler) {
        this.player_control = player_control
        this.number_values = tokens.map(this.parse_token)
    }

    parse_token = (token: Token) => {
        if (token.type === "number") return {value: token.value}
        if (token.type === "keyword") return {value: this.parse_keyword_token(token)}
        if (token.type === "dice") return {min: 1, max: token.faces}
        throw Error(`token type invalid: ${token}`)
    }

    parse_keyword_token = (token: KeywordToken) => {
        assert(token.type === "keyword", () => `token is not of keword type: ${token}`)
        const creature = this.parse_keyword(token.value)
        return this.parse_creature_property(creature, token.property)
    }

    parse_keyword = (keyword: string) => {
        if (keyword === "owner") return this.player_control.get_selected_creature()
        throw Error(`Invalid keyword ${keyword}`)
    }

    parse_creature_property = (creature: Creature, property: string | undefined) => {
        if (property === undefined) throw Error(`property can't be undefined here`)
        if (property === "movement") return creature.data.movement
        throw Error(`Invalid property ${property}`)
    }

    get_resolved_number_values = (): Array<ResolvedNumberValue> => {
        assert(this.number_values.every(x => is_resolved_number_value(x)), () => "found unresolved number values")
        return this.number_values as Array<ResolvedNumberValue>
    }

    get_all_number_values = (): Array<NumberValue> => {
        return this.number_values
    }
}

type NumberValue = ResolvedNumberValue | UnresolvedNumberValue

type ResolvedNumberValue = {
    value: number
}

type UnresolvedNumberValue = {
    min: number
    max: number
}

const is_resolved_number_value = (value: NumberValue): value is ResolvedNumberValue => value.hasOwnProperty("value")

function add_preview_card_handlers({}) {

}

const add_all_resolved_number_values = (number_values: Array<ResolvedNumberValue>) => {
    return number_values.reduce((result, x) => x.value + result, 0)
}

const resolve_all_unresolved_number_values = (number_values: Array<NumberValue>): Array<ResolvedNumberValue> => {
    return number_values.map(x => is_resolved_number_value(x) ? x : {value: get_random_number(x)})
}

const get_random_number= ({min, max}: {min: number, max: number}) => {
    assert(min <= max, () => "min can not be lower than max")
    const result = Math.floor(Math.random() * (max - min + 1)) + min
    assert(min <= result && result <= max, () => `result of random needs to be bewteen mind and max, was ${result}`)
    return result
}