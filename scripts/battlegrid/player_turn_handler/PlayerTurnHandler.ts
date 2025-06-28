import {BattleGrid} from "battlegrid/BattleGrid";
import {OnPositionClick, Position} from "battlegrid/Position";
import {
    BASIC_ATTACK_ACTIONS,
    BASIC_MOVEMENT_ACTIONS,
} from "powers/basic";
import {ActionLog} from "action_log/ActionLog";
import {
    preview_expression,
    ExpressionResult,
    resolve_number,
    is_number,
    ExpressionResultNumberResolved,
    preview_defense
} from "expression_parsers/preview_expression";
import {roll_d} from "randomness/dice";
import {Creature} from "battlegrid/creatures/Creature";
import {assert} from "assert";
import {Consequence, ConsequenceSelectTarget, PowerVM} from "tokenizer/transform_power_ir_into_vm_representation";

type PlayerTurnHandlerContextSelect = PlayerTurnHandlerContextSelectPosition | PlayerTurnHandlerContextSelectOption

type PlayerTurnHandlerContextSelectPosition = {
    type: "position_select"
    currently_selected: Creature
    available_targets: Array<Position>
    on_click: (position: Position) => void
}

type PlayerTurnHandlerContextSelectOption = {
    type: "option_select"
    currently_selected: Creature
    available_options: Array<ButtonOption>
}

type ButtonOption = {
    text: string,
    onClick: () => void
    disabled?: boolean,
}

export class PlayerTurnHandler {
    private action_log: ActionLog
    private battle_grid: BattleGrid

    private selection_context: PlayerTurnHandlerContextSelect | null = null

    constructor(battle_grid: BattleGrid, action_log: ActionLog) {
        this.battle_grid = battle_grid
        this.action_log = action_log
    }

    set_awaiting_position_selection = (context: Omit<PlayerTurnHandlerContextSelectPosition, "type">) => {
        this.deselect()

        this.selection_context = {
            type: "position_select",
            ...context
        }

        this.select(context.currently_selected)

        const squares = context.available_targets.map(this.battle_grid.get_square)
        squares.forEach(({visual}) => visual.setIndicator("available-target"))
    }

    set_awaiting_option_selection = (context: Omit<PlayerTurnHandlerContextSelectOption, "type">) => {
        this.deselect()

        this.selection_context = {
            type: "option_select",
            ...context
        }

        this.select(context.currently_selected)

        const actions_menu = document.querySelector("#actions_menu")!

        context.available_options.forEach(option => {
            const button = document.createElement("button");
            button.innerText = option.text
            if (option.disabled)
                button.setAttribute("disabled", "")

            button.addEventListener("click", () => {
                    this.clear_actions_menu()
                    option.onClick()

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
            actions_menu.appendChild(button)
        })
    }

    onClick: OnPositionClick = ({position}) => {
        if (this.has_selected_creature()) {
            if (this.is_available_target(position))
                this.target(position)
        } else {
            if (this.battle_grid.is_terrain_occupied(position)) {
                const creature = this.battle_grid.get_creature_by_position(position)

                this.set_awaiting_option_selection({
                    currently_selected: creature,
                    available_options: this.build_actions_menu(creature)
                })
            }
        }
    }

    select(creature: Creature) {
        const cell = this.battle_grid.get_square(creature.data.position)
        cell.visual.setIndicator("selected")
    }

    target(position: Position) {
        if (this.selection_context?.type !== "position_select") throw Error("available targets are not set")
        this.selection_context.on_click(position)
    }

    deselect() {
        if (this.selection_context === null) return
        const square = this.battle_grid.get_square(this.selection_context.currently_selected.data.position)
        square.visual.clearIndicator()

        if (this.selection_context.type === "position_select") {
            const squares = this.selection_context.available_targets.map(this.battle_grid.get_square)
            squares.forEach(square => square.visual.clearIndicator())
        }

        this.selection_context = null
    }

    is_available_target = (position: Position) => {
        if (this.selection_context?.type !== "position_select") throw Error("available targets are not set")
        return this.selection_context.available_targets.some(p => positions_equal(p, position))
    }

    has_selected_creature = () => this.selection_context !== null

    build_actions_menu(creature: Creature): Array<ButtonOption> {
        return [
            ...BASIC_MOVEMENT_ACTIONS.map(power => this.build_action_button(power, creature)),
            ...BASIC_ATTACK_ACTIONS.map(power => this.build_action_button(power, creature)),
            ...creature.data.powers.map(power => this.build_action_button(power, creature)),
            {
                text: "Cancel",
                onClick: () => {
                    this.deselect()
                    this.clear_actions_menu()
                }
            }
        ]
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
            return this.battle_grid.get_adjacent({origin})
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

    get_valid_targets = ({consequence, context, creature}: {
        consequence: ConsequenceSelectTarget
        context: ActivePowerContext
        creature: Creature
    }) => (
        [...this.get_in_range({
            targeting: consequence,
            origin: creature.data.position,
            context
        })]
            .filter(position => this.filter_targets({
                targeting: consequence,
                position
            }))
    )

    build_action_button(action: PowerVM, creature: Creature): ButtonOption {
        const context = new ActivePowerContext(action.consequences)
        context.set_variable({name: "owner", value: creature, type: "creature"})

        const evaluate_consequences = () => {
            while (context.has_consequences()) {
                const consequence = context.next_consequence()

                switch (consequence.type) {
                    case "select_target": {
                        const valid_targets = this.get_valid_targets({consequence, context, creature})

                        const filtered = valid_targets.filter(
                            target => !consequence.exclude.some(
                                excluded => positions_equal(context.get_creature(excluded).data.position, target)
                            )
                        )

                        if (filtered.length > 0) {
                            const on_click = (position: Position) => {
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

                            this.set_awaiting_position_selection({
                                currently_selected: context.get_creature("owner"),
                                available_targets: filtered,
                                on_click
                            })
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
                    case "push": {
                        const atacker = context.get_creature("owner")
                        const defender = context.get_creature(consequence.target)

                        //TODO contemplate push length
                        const alternatives = this.battle_grid.get_push_positions({
                            attacker_origin: atacker.data.position,
                            defender_origin: defender.data.position,
                            amount: 1
                        })

                        if (alternatives.length > 0) {
                            this.set_awaiting_position_selection({
                                currently_selected: context.get_creature("owner"),
                                available_targets: alternatives,
                                on_click: (position) => {
                                    this.deselect()
                                    this.battle_grid.place_creature({creature: defender, position})
                                    evaluate_consequences()
                                }
                            })
                        }

                        return;
                    }
                    case "save_position": {
                        const target = context.get_creature(consequence.target)
                        context.set_variable({type: "position", name: consequence.label, value: target.data.position})
                        break
                    }
                    case "options": {
                        this.set_awaiting_option_selection({
                            currently_selected: context.get_creature("owner"),
                            available_options: consequence.options.map(option => ({
                                    text: option.text,
                                    onClick: () => {
                                        this.deselect()
                                        context.add_consequences(option.consequences)
                                        evaluate_consequences()
                                    }
                                })
                            )
                        })
                        break;
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

        const first_consequence = action.consequences[0]

        const result: ButtonOption = {
            text: action.name,
            disabled: false,
            onClick: evaluate_consequences
        }

        if (first_consequence.type === "select_target") {
            const valid_targets = this.get_valid_targets({consequence: first_consequence, context, creature})
            result.disabled = valid_targets.length === 0
        }

        return result
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

    get_variable = (name: string) => {
        const variable = this.variables.get(name)
        if (!variable) throw Error(`variable ${name} not found in context`)
        return variable
    }
}

const positions_equal = (position1: Position, position2: Position) => {
    return position1.x === position2.x && position1.y === position2.y
}