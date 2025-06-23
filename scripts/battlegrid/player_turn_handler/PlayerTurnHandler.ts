import {BattleGrid, Square} from "battlegrid/BattleGrid";
import {Position} from "battlegrid/Position";
import {
    BASIC_ATTACK_ACTIONS,
    BASIC_MOVEMENT_ACTIONS,
} from "powers/basic";
import {ActionLog} from "action_log/ActionLog";
import {
    add_all_resolved_number_values,
    IntFormulaFromTokens,
    resolve_all_unresolved_number_values
} from "formulas/IntFormulaFromTokens";
import {roll_d} from "randomness/dice";
import {Creature} from "battlegrid/creatures/Creature";
import {get_attack, get_defense} from "character_sheet/character_sheet";
import {assert} from "assert";
import {Consequence, ConsequenceSelectTarget, PowerVM} from "tokenizer/transform_power_ir_into_vm_representation";
import {resolve_tokens_to_boolean} from "formulas/BooleanFormulaFromTokens";

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


    get_in_range({targeting, origin, context}: {
        targeting: ConsequenceSelectTarget["targeting"],
        origin: Position,
        context: ActivePowerContext
    }) {
        if (targeting.type === "movement") {
            const distance = new IntFormulaFromTokens(targeting.distance, context).get_resolved_number_values()
            return this.battle_grid.get_move_area({
                origin,
                distance: add_all_resolved_number_values(distance)
            })
        } else if (targeting.type === "melee weapon") {
            return this.battle_grid.get_melee({origin})
        } else if (targeting.type === "adjacent") {
            return this.battle_grid.get_adyacent({origin})
        }

        throw `Range "${JSON.stringify(targeting)}" not supported`
    }

    filter_targets({targeting, position}: { targeting: ConsequenceSelectTarget["targeting"], position: Position }) {
        if (targeting.target_type === "terrain")
            return !this.battle_grid.is_terrain_occupied(position)
        if (targeting.target_type === "enemy")
            return this.battle_grid.is_terrain_occupied(position)

        throw `Target "${targeting.type}" not supported`
    }

    build_action_button(action: PowerVM) {
        const button = document.createElement("button");

        const context = new ActivePowerContext(action.consequences)
        context.set_variable({name: "owner", value: this.get_selected_creature(), type: "creature"})

        const first_consequence = action.consequences[0]

        if (first_consequence.type === "select_target") {
            const valid_targets = [...this.get_in_range({
                targeting: first_consequence.targeting,
                origin: this.get_selected_creature().data.position,
                context
            })]
                .filter(square => this.filter_targets({
                    targeting: first_consequence.targeting,
                    position: square.position
                }))

            if (valid_targets.length === 0)
                button.setAttribute("disabled", "")
        }

        /*
                const action_preview = document.querySelector("#action_preview")!
                button.addEventListener("mouseenter", () => {
                    action_preview.textContent = ""
                })
         */

        const evaluate_consequences = () => {
            while (context.has_consequences()) {
                const consequence = context.next_consequence()

                switch (consequence.type) {
                    case "select_target": {
                        const valid_targets = [...this.get_in_range({
                            targeting: consequence.targeting,
                            origin: context.get_creature("owner").data.position,
                            context
                        })]
                            .filter(square => this.filter_targets({
                                targeting: consequence.targeting,
                                position: square.position
                            }))

                        const excluded = valid_targets.filter(
                            target => !consequence.targeting.exclude.some(
                                excluded => context.get_creature(excluded).data.position.x === target.position.x &&
                                    context.get_creature(excluded).data.position.y === target.position.y
                            )
                        )

                        if (excluded.length > 0) {
                            this.select(context.get_creature("owner"))

                            const onClick = (position: Position) => {
                                this.deselect()

                                if (consequence.targeting.target_type === "terrain")
                                    context.set_variable({
                                        name: consequence.targeting.label,
                                        value: position,
                                        type: "position"
                                    })
                                else
                                    context.set_variable({
                                        name: consequence.targeting.label,
                                        value: this.battle_grid.get_creature_by_position(position),
                                        type: "creature"
                                    })

                                evaluate_consequences()
                            }

                            this.set_available_targets({squares: excluded, onClick})
                            return
                        }
                        break
                    }
                    case "attack_roll": {
                        const d20_result = roll_d(20)

                        const attacker = context.get_creature("owner")
                        const defender = context.get_creature("primary_target")

                        const attack = [...get_attack({
                            creature: attacker,
                            attribute_code: consequence.attack
                        }), d20_result]
                        const defense = get_defense({creature: defender, defense_code: consequence.defense})
                        const is_hit = add_all_resolved_number_values(attack) >= add_all_resolved_number_values(defense)

                        this.action_log.add_new_action_log(`${attacker.data.name}'s ${action.name} (`, attack, `) ${is_hit ? "hits" : "misses"} against ${defender.data.name}'s AC (`, defense, `).`)

                        if (is_hit)
                            context.add_consequences(consequence.hit)
                        else
                            defender.display_miss()
                        break
                    }
                    case "apply_damage": {
                        const target = context.get_creature(consequence.target)
                        const resolved = resolve_all_unresolved_number_values(new IntFormulaFromTokens(consequence.value, context).get_all_number_values())
                        target.receive_damage(add_all_resolved_number_values(resolved))
                        this.action_log.add_new_action_log(`${target.data.name} was dealt `, resolved, ` damage.`)
                        break
                    }
                    case "move": {
                        const creature = context.get_creature(consequence.target)
                        const destination = context.get_position(consequence.destination)
                        this.battle_grid.place_creature({creature, position: destination})
                        break
                    }
                    case "shift": {
                        const creature = context.get_creature(consequence.target)
                        const destination = context.get_position(consequence.destination)
                        this.battle_grid.place_creature({creature, position: destination})
                        break
                    }
                    case "condition": {
                        const condition = resolve_tokens_to_boolean({token: consequence.condition, context})
                        if (condition)
                            context.add_consequences(consequence.consequences_true)
                        break
                    }
                    default:
                        throw Error("action not implemented " + JSON.stringify(consequence))
                }
            }
        }

        button.addEventListener("click", () => {
                this.clear_actions_menu()
                evaluate_consequences()

                //TODO can be better
                // this.battle_grid.get_all_creatures().forEach(creature => creature.remove_hit_chance_on_hover())


                /* TODO re add chance
                        if (action.roll) {
                            valid_targets.forEach(square => {
                                const owner = this.get_selected_creature()
                                const target = this.battle_grid.get_creature_by_position(square.position)

                                const attack = add_all_resolved_number_values(get_attack({creature: owner, attribute_code: "str"}))
                                const defense = add_all_resolved_number_values(get_defense({creature: target, defense_code: "ac"}))
                                const chance = (attack + 20 - defense + 1) * 5

                                target.display_hit_chance_on_hover({attack, defense, chance})
                            })
                        }
                */
            }
        )

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

type ActivePowerVariable =
    { type: "creature", value: Creature } |
    { type: "position", value: Position }

export class ActivePowerContext {
    private variables: Map<string, ActivePowerVariable> = new Map()
    private consequences: Array<Consequence> = []

    constructor(consequences: Array<Consequence>) {
        this.consequences = consequences
    }

    set_variable = ({name, ...variable}: { name: string } & ActivePowerVariable) => {
        this.variables.set(name, variable)
    }

    get_creature = (name: string): Creature => {
        const variable = this.variables.get(name)
        if (!variable) throw Error(`variable ${name} not found in context`)
        if (variable.type !== "creature") throw Error(`variable ${name} expected to be a 'creature', but its a '${variable.type}'`)
        return variable.value
    }

    get_position = (name: string): Position => {
        const variable = this.variables.get(name)
        if (!variable) throw Error(`variable ${name} not found in context`)
        if (variable.type !== "position") throw Error(`variable ${name} expected to be a 'position', but its a '${variable.type}'`)
        return variable.value
    }

    next_consequence = (): Consequence => {
        assert(this.consequences.length > 0, () => "no consequences left when calling next consequence")
        const [next, ...consequences] = this.consequences
        this.consequences = consequences
        return next
    }

    has_consequences = (): boolean => {
        return this.consequences.length > 0
    }

    has_variable = (name: string): boolean => {
        return this.variables.has(name)
    }

    add_consequences = (consequences: Array<Consequence>): void => {
        this.consequences = [...consequences, ...this.consequences]
    }
}

function add_preview_card_handlers({}) {

}