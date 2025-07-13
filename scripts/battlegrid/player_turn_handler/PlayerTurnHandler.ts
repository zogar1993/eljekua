import {BattleGrid} from "battlegrid/BattleGrid";
import {OnPositionEvent, Position, positions_equal} from "battlegrid/Position";
import {BASIC_ATTACK_ACTIONS, BASIC_MOVEMENT_ACTIONS,} from "powers/basic";
import {ActionLog} from "action_log/ActionLog";
import {NODE, token_to_node} from "expression_parsers/token_to_node";
import {Creature} from "battlegrid/creatures/Creature";
import {ConsequenceSelectTarget, PowerVM} from "tokenizer/transform_power_ir_into_vm_representation";
import {PowerContext} from "battlegrid/player_turn_handler/PowerContext";
import {TurnContext} from "battlegrid/player_turn_handler/TurnContext";
import {get_move_area} from "battlegrid/ranges/get_move_area";
import {get_adjacent} from "battlegrid/ranges/get_adyacent";
import {interpret_consequence} from "battlegrid/player_turn_handler/consequence_interpreters/interpret_consequence";

type PlayerTurnHandlerContextSelect =
    PlayerTurnHandlerContextSelectPosition
    | PlayerTurnHandlerContextSelectOption
    | PlayerTurnHandlerContextSelectPath

type PlayerTurnHandlerContextSelectPosition = {
    type: "position_select"
    currently_selected: Creature
    available_targets: Array<Position>
    on_click: (position: Position) => void
}

type PlayerTurnHandlerContextSelectPath = {
    type: "path_select"
    currently_selected: Creature
    available_targets: Array<Position>
    current_path: Array<Position>
    on_click: (position: Position) => void
    on_hover: (position: Position) => void
}

type PlayerTurnHandlerContextSelectOption = {
    type: "option_select"
    currently_selected: Creature
    available_options: Array<ButtonOption>
}

type ButtonOption = {
    text: string,
    on_click: () => void
    disabled?: boolean,
}

export class PlayerTurnHandler {
    private action_log: ActionLog
    private battle_grid: BattleGrid
    turn_context = new TurnContext()

    selection_context: PlayerTurnHandlerContextSelect | null = null

    constructor(battle_grid: BattleGrid, action_log: ActionLog) {
        this.battle_grid = battle_grid
        this.action_log = action_log
    }

    set_awaiting_position_selection = (context: Omit<PlayerTurnHandlerContextSelectPosition, "type">) => {
        this.deselect()

        this.selection_context = {type: "position_select", ...context}

        this.select(context.currently_selected)

        const squares = context.available_targets.map(this.battle_grid.get_square)
        squares.forEach(({visual}) => visual.setIndicator("available-target"))
    }

    set_awaiting_path_selection = (context: Omit<PlayerTurnHandlerContextSelectPath, "type">) => {
        this.deselect()

        this.selection_context = {
            type: "path_select",
            ...context
        }

        this.select(context.currently_selected)

        const squares = context.available_targets.map(this.battle_grid.get_square)
        squares.forEach(({visual}) => visual.setIndicator("available-target"))

        const path = context.current_path.map(this.battle_grid.get_square)
        path.forEach(({visual}) => visual.setIndicator("current-path"))
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
                    option.on_click()
                    this.evaluate_consequences()

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

    onClick: OnPositionEvent = ({position}) => {
        if (this.selection_context?.type === "position_select" || this.selection_context?.type === "path_select") {
            if (this.selection_context.available_targets.some(p => positions_equal(p, position))) {
                this.selection_context.on_click(position)
                this.evaluate_consequences()
            }
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

    onHover: OnPositionEvent = ({position}) => {
        if (this.selection_context?.type === "path_select") {
            this.selection_context.on_hover(position)
        }
    }

    select(creature: Creature) {
        const cell = this.battle_grid.get_square(creature.data.position)
        cell.visual.setIndicator("selected")
    }

    deselect() {
        if (this.selection_context === null) return
        const square = this.battle_grid.get_square(this.selection_context.currently_selected.data.position)
        square.visual.clearIndicator()

        if (this.selection_context.type === "position_select") {
            const squares = this.selection_context.available_targets.map(this.battle_grid.get_square)
            squares.forEach(square => square.visual.clearIndicator())
        } else if (this.selection_context.type === "path_select") {
            const squares = this.selection_context.available_targets.map(this.battle_grid.get_square)
            squares.forEach(square => square.visual.clearIndicator())
            const path = this.selection_context.current_path.map(this.battle_grid.get_square)
            path.forEach(square => square.visual.clearIndicator())
        }

        this.selection_context = null
    }

    has_selected_creature = () => this.selection_context !== null

    build_actions_menu(creature: Creature): Array<ButtonOption> {
        return [
            ...BASIC_MOVEMENT_ACTIONS.map(power => this.build_action_button(power, creature)),
            ...BASIC_ATTACK_ACTIONS.map(power => this.build_action_button(power, creature)),
            ...creature.data.powers.map(power => this.build_action_button(power, creature)),
            {
                text: "Cancel",
                on_click: () => {
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
        context: PowerContext
    }) {
        if (targeting.targeting_type === "movement") {
            const distance = NODE.as_number_resolved(token_to_node({token: targeting.distance, context}))
            return get_move_area({origin, distance: distance.value, battle_grid: this.battle_grid})
        } else if (targeting.targeting_type === "melee_weapon") {
            return this.battle_grid.get_melee({origin})
        } else if (targeting.targeting_type === "adjacent") {
            return get_adjacent({position: origin, battle_grid: this.battle_grid})
        } else if (targeting.targeting_type === "ranged") {
            const distance = token_to_node({token: targeting.distance, context})

            if (distance.type !== "number_resolved") throw "distance needs to be number resolved"
            return this.battle_grid.get_in_range({origin, distance: distance.value})
        }

        throw `Range "${JSON.stringify(targeting)}" not supported`
    }

    filter_targets({targeting, position}: { targeting: ConsequenceSelectTarget, position: Position }) {
        if (targeting.target_type === "terrain")
            return !this.battle_grid.is_terrain_occupied(position)
        if (targeting.target_type === "path")
            return !this.battle_grid.is_terrain_occupied(position)
        if (targeting.target_type === "enemy")
            return this.battle_grid.is_terrain_occupied(position)
        if (targeting.target_type === "creature")
            return this.battle_grid.is_terrain_occupied(position)

        throw `Target "${targeting.target_type}" not supported`
    }

    get_valid_targets = ({consequence, context}: { consequence: ConsequenceSelectTarget, context: PowerContext }) => (
        this.get_in_range({
            targeting: consequence,
            origin: context.get_creature("owner").data.position,
            context
        })
            .filter(position => this.filter_targets({
                targeting: consequence,
                position
            }))
    )

    evaluate_consequences = () => {
        while (!this.has_selected_creature()) {
            const consequence = this.turn_context.next_consequence()

            // Reached the end of all consequences
            if (consequence === null) return
            const context = this.turn_context.get_current_context()

            interpret_consequence({
                consequence,
                context,
                player_turn_handler: this,
                battle_grid: this.battle_grid,
                action_log: this.action_log
            })
        }
    }

    build_action_button(action: PowerVM, creature: Creature): ButtonOption {

        const first_consequence = action.consequences[0]

        const context = new PowerContext(action.consequences, action.name)
        context.set_variable({name: "owner", value: creature, type: "creature"})

        const result: ButtonOption = {
            text: action.name,
            disabled: false,
            on_click: () => {
                this.deselect()
                //TODO make this better
                this.turn_context.add_power_context(context)
            }
        }

        if (first_consequence.type === "select_target") {
            const valid_targets = this.get_valid_targets({consequence: first_consequence, context})
            result.disabled = valid_targets.length === 0
        }

        return result
    }
}
