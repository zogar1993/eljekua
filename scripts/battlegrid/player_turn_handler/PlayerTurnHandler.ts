import {BattleGrid, Square} from "battlegrid/BattleGrid";
import {Position} from "battlegrid/Position";
import {BASIC_ATTACK_ACTIONS, BASIC_MOVEMENT_ACTIONS} from "powers/basic";
import {Power} from "types";
import {ActionLog} from "action_log/ActionLog";
import {
    add_all_resolved_number_values,
    IntFormulaFromTokens,
    resolve_all_unresolved_number_values
} from "formulas/IntFormulaFromTokens";
import {roll_d} from "randomness/dice";
import {Creature} from "battlegrid/creatures/Creature";
import {get_attack, get_defense} from "character_sheet/character_sheet";

export class PlayerTurnHandler {
    private action_log: ActionLog
    private battle_grid: BattleGrid
    private available_targets: AvailableTargets | null = null
    private selected: null | Creature = null

    constructor(battle_grid: BattleGrid, action_log: ActionLog) {
        this.battle_grid = battle_grid
        this.action_log = action_log
    }

    select(creature: Creature) {
        this.selected = creature
        const cell = this.battle_grid.get_square(creature.data.position)
        cell.visual.setIndicator("selected")
        this.build_actions_menu()
    }

    target(position: Position) {
        if (this.available_targets === null) throw Error("available targets are not set")
        this.available_targets?.onClick(position)
    }

    deselect() {
        const square = this.battle_grid.get_square(this.get_selected_creature().data.position)
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
            origin: this.get_selected_creature().data.position
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
                if (action.attack && action.hit) {
                    const owner = this.get_selected_creature()
                    const target = this.battle_grid.get_creature_by_position(position)
                    this.deselect()

                    const d20_result = roll_d(20)

                    const attack = [...get_attack({creature: owner, attribute_code: "str"}), d20_result]
                    const defense = get_defense({creature: target, defense_code: "ac"})
                    const is_hit = add_all_resolved_number_values(attack) >= add_all_resolved_number_values(defense)

                    this.action_log.add_new_action_log(`${owner.data.name}'s ${action.name} (`, attack, `) ${is_hit ? "hits" : "misses"} against ${target.data.name}'s AC (`, defense, `).`)

                    if (is_hit)
                        action.hit.forEach(consequence => {
                            if ("apply_damage" === consequence.type) {
                                const resolved = resolve_all_unresolved_number_values(new IntFormulaFromTokens(consequence.value, this).get_all_number_values())
                                target.receive_damage(add_all_resolved_number_values(resolved))
                                this.action_log.add_new_action_log(`${target.data.name} was dealt `, resolved, ` damage.`)
                            } else {
                                throw Error("action not implemented " + consequence.type)
                            }
                        })
                    else
                        target.display_miss()
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
                this.battle_grid.get_all_creatures().forEach(creature => creature.remove_hit_chance_on_hover())
            }
            this.set_available_targets({squares: valid_targets, onClick})

            if (action.attack) {
                valid_targets.forEach(square => {
                    const owner = this.get_selected_creature()
                    const target = this.battle_grid.get_creature_by_position(square.position)

                    const attack = add_all_resolved_number_values(get_attack({creature: owner, attribute_code: "str"}))
                    const defense = add_all_resolved_number_values(get_defense({creature: target, defense_code: "ac"}))
                    const chance = (attack + 20 - defense + 1) * 5

                    target.display_hit_chance_on_hover({attack, defense, chance})
                    //TODO remove the hover
                })
            }

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

function add_preview_card_handlers({}) {

}