import {BattleGrid, Square} from "battlegrid/BattleGrid";
import {Position} from "battlegrid/Position";
import {
    BASIC_ATTACK_ACTIONS,
    BASIC_MOVEMENT_ACTIONS,
} from "powers/basic";
import {ActionLog} from "action_log/ActionLog";
import {
    preview_expression,
    ExpressionResult,
    resolve_number, is_number, ExpressionResultNumberResolved, preview_defense
} from "expression_parsers/parse_expression_to_number_values";
import {roll_d} from "randomness/dice";
import {Creature} from "battlegrid/creatures/Creature";
import {assert} from "assert";
import {Consequence, ConsequenceSelectTarget, PowerVM} from "tokenizer/transform_power_ir_into_vm_representation";

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
        targeting: ConsequenceSelectTarget,
        origin: Position,
        context: ActivePowerContext
    }) {
        if (targeting.targeting_type === "movement") {
            const distance = preview_expression({token: targeting.distance, context})

            if (distance.type !== "number_resolved") throw "distance needs to be number resolved"

            return this.battle_grid.get_move_area({origin, distance: distance.value})
        } else if (targeting.targeting_type === "melee_weapon") {
            return this.battle_grid.get_melee({origin})
        } else if (targeting.targeting_type === "adjacent") {
            return this.battle_grid.get_adyacent({origin})
        } else if (targeting.targeting_type === "ranged") {
            const distance = preview_expression({token: targeting.distance, context})

            if (distance.type !== "number_resolved") throw "distance needs to be number resolved"
            return this.battle_grid.get_in_range({origin, distance: distance.value})
        }

        throw `Range "${JSON.stringify(targeting)}" not supported`
    }

    filter_targets({targeting, position}: { targeting: ConsequenceSelectTarget, position: Position }) {
        if (targeting.target_type === "terrain")
            return !this.battle_grid.is_terrain_occupied(position)
        if (targeting.target_type === "enemy")
            return this.battle_grid.is_terrain_occupied(position)
        if (targeting.target_type === "creature")
            return this.battle_grid.is_terrain_occupied(position)

        throw `Target "${targeting.target_type}" not supported`
    }

    build_action_button(action: PowerVM) {
        const button = document.createElement("button");

        const context = new ActivePowerContext(action.consequences)
        context.set_variable({name: "owner", value: this.get_selected_creature(), type: "creature"})

        const first_consequence = action.consequences[0]

        if (first_consequence.type === "select_target") {
            const valid_targets = [...this.get_in_range({
                targeting: first_consequence,
                origin: this.get_selected_creature().data.position,
                context
            })]
                .filter(square => this.filter_targets({
                    targeting: first_consequence,
                    position: square.position
                }))

            if (valid_targets.length === 0)
                button.setAttribute("disabled", "")
        }

        const evaluate_consequences = () => {
            while (context.has_consequences()) {
                const consequence = context.next_consequence()

                switch (consequence.type) {
                    case "select_target": {
                        const valid_targets = [...this.get_in_range({
                            targeting: consequence,
                            origin: context.get_creature("owner").data.position,
                            context
                        })]
                            .filter(square => this.filter_targets({
                                targeting: consequence,
                                position: square.position
                            }))

                        const excluded = valid_targets.filter(
                            target => !consequence.exclude.some(
                                excluded => context.get_creature(excluded).data.position.x === target.position.x &&
                                    context.get_creature(excluded).data.position.y === target.position.y
                            )
                        )

                        if (excluded.length > 0) {
                            this.select(context.get_creature("owner"))

                            const onClick = (position: Position) => {
                                this.deselect()

                                if (consequence.target_type === "terrain")
                                    context.set_variable({
                                        name: consequence.label,
                                        value: position,
                                        type: "position"
                                    })
                                else
                                    context.set_variable({
                                        name: consequence.label,
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
                        const defender = context.get_creature(consequence.defender)

                        const attack_base = preview_expression({token: consequence.attack, context})
                        if (attack_base.type !== "number_resolved") throw Error(`Attack formula did not evaluate to a resolved number`)

                        const attack: ExpressionResult = {
                            type: "number_resolved",
                            value: attack_base.value + d20_result.value,
                            params: [
                                attack_base,
                                {type: "number_resolved", value: d20_result.value, description: "d20"}
                            ],
                            description: "attack"
                        }

                        const defense = preview_defense({defender, defense_code: consequence.defense})
                        if (defense.type !== "number_resolved") throw Error(`Defense formula did not evaluate to a resolved number`)
                        const is_hit = attack.value >= defense.value

                        this.action_log.add_new_action_log(`${attacker.data.name}'s ${action.name} (`, attack, `) ${is_hit ? "hits" : "misses"} against ${defender.data.name}'s ${consequence.defense} (`, defense, `).`)

                        if (is_hit)
                            context.add_consequences(consequence.hit)
                        else {
                            defender.display_miss()
                            context.add_consequences(consequence.miss)
                        }
                        break
                    }
                    case "apply_damage": {
                        const target = context.get_creature(consequence.target)

                        const damage = preview_expression({token: consequence.value, context})

                        if (!is_number(damage)) throw Error(`Defense formula did not evaluate to a resolved number`)

                        const resolved = resolve_number(damage)

                        const result = resolved.value

                        const modified_result: ExpressionResultNumberResolved = consequence.half_damage ? {
                            type: "number_resolved",
                            value: Math.floor(result / 2),
                            params: [resolved],
                            description: "half damage"
                        } : resolved

                        target.receive_damage(modified_result.value)
                        this.action_log.add_new_action_log(`${target.data.name} was dealt `, modified_result, `${consequence.half_damage ? " half" : ""} damage.`)
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
                        const condition = preview_expression({token: consequence.condition, context})

                        if (condition.type !== "boolean") throw Error("Condition can only be boolean")

                        if (condition.value)
                            context.add_consequences(consequence.consequences_true)
                        else
                            context.add_consequences(consequence.consequences_false)
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
