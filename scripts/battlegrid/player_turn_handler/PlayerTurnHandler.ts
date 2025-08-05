import {BattleGrid} from "battlegrid/BattleGrid";
import {OnPositionEvent, Position, positions_equal} from "battlegrid/Position";
import {ActionLog} from "action_log/ActionLog";
import {NODE, preview_defense, token_to_node} from "expression_parsers/token_to_node";
import {Creature} from "battlegrid/creatures/Creature";
import {Consequence, ConsequenceSelectTarget} from "tokenizer/transform_power_ir_into_vm_representation";
import {PowerContext} from "battlegrid/player_turn_handler/PowerContext";
import {TurnContext} from "battlegrid/player_turn_handler/TurnContext";
import {get_move_area} from "battlegrid/ranges/get_move_area";
import {get_adjacent} from "battlegrid/ranges/get_adyacent";
import {interpret_consequence} from "battlegrid/player_turn_handler/consequence_interpreters/interpret_consequence";
import {SquareVisual} from "battlegrid/squares/SquareVisual";
import {ButtonOption} from "battlegrid/creatures/CreatureVisual";

type PlayerTurnHandlerContextSelect =
    PlayerTurnHandlerContextSelectPosition
    | PlayerTurnHandlerContextSelectOption
    | PlayerTurnHandlerContextSelectPath
    | PlayerTurnHandlerContextSelectAreaBurst

type PlayerTurnHandlerContextSelectPosition = {
    type: "position_select"
    currently_selected: Creature
    available_targets: Array<Position>
    on_click: (position: Position) => void
    on_hover: (position: Position) => void
}

type PlayerTurnHandlerContextSelectPath = {
    type: "path_select"
    currently_selected: Creature
    available_targets: Array<Position>
    current_path: Array<Position>
    on_click: (position: Position) => void
    on_hover: (position: Position) => void
}

type PlayerTurnHandlerContextSelectAreaBurst = {
    type: "area_burst_select"
    currently_selected: Creature
    available_targets: Array<Position>
    affected_area: Array<Position>
    affected_targets: Array<Position>
    on_click: (position: Position) => void
    on_hover: (position: Position) => void
}

type PlayerTurnHandlerContextSelectOption = {
    type: "option_select"
    currently_selected: Creature
    available_options: Array<ButtonOption>
}

export class PlayerTurnHandler {
    private readonly action_log: ActionLog
    private readonly battle_grid: BattleGrid
    turn_context = new TurnContext()

    selection_context: PlayerTurnHandlerContextSelect | null = null

    constructor(battle_grid: BattleGrid, action_log: ActionLog) {
        this.battle_grid = battle_grid
        this.action_log = action_log
    }

    set_awaiting_position_selection = (context: Omit<PlayerTurnHandlerContextSelectPosition, "type" | "currently_selected" | "on_hover">) => {
        const currently_selected = this.turn_context.get_current_context().owner()
        //TODO this should be better on_hover
        this.selection_context = {type: "position_select", currently_selected, on_hover: () => {}, ...context}

        this.set_selected_indicator()

        this.set_indicator_to_positions({positions: context.available_targets, indicator: "available-target"})
    }

    set_awaiting_path_selection = (context: Omit<PlayerTurnHandlerContextSelectPath, "type" | "currently_selected">) => {
        const currently_selected = this.turn_context.get_current_context().owner()
        this.selection_context = {type: "path_select", currently_selected, ...context}

        this.set_selected_indicator()

        this.set_indicator_to_positions({positions: context.available_targets, indicator: "available-target"})
        this.set_indicator_to_positions({positions: context.current_path, indicator: "current-path"})
    }

    set_awaiting_area_burst_selection = (context: Omit<PlayerTurnHandlerContextSelectAreaBurst, "type" | "currently_selected">) => {
        const currently_selected = this.turn_context.get_current_context().owner()
        this.selection_context = {type: "area_burst_select", currently_selected, ...context}

        this.set_selected_indicator()

        this.set_indicator_to_positions({positions: context.available_targets, indicator: "available-target"})
        this.set_indicator_to_positions({positions: context.affected_area, indicator: "area"})
    }

    set_awaiting_option_selection = (context: Omit<PlayerTurnHandlerContextSelectOption, "type" | "currently_selected">) => {
        const currently_selected = this.turn_context.get_current_context().owner()
        this.selection_context = {type: "option_select", currently_selected, ...context}

        this.set_selected_indicator()

        const options = context.available_options.map(option => ({
            ...option,
            on_click: () => {
                option.on_click()
                this.deselect()
                this.evaluate_consequences()
            }
        }))
        currently_selected.visual.display_options(options)
    }

    on_click: OnPositionEvent = ({position}) => {
        if (this.selection_context?.type === "position_select" || this.selection_context?.type === "path_select" || this.selection_context?.type === "area_burst_select") {
            if (this.selection_context.available_targets.some(p => positions_equal(p, position))) {
                this.selection_context.on_click(position)
                this.deselect()
                this.evaluate_consequences()
            }
        } else if (this.selection_context === null) {
            if (this.battle_grid.is_terrain_occupied(position)) {
                const creature = this.battle_grid.get_creature_by_position(position)
                const consequences: Array<Consequence> = [{type: "add_powers", creature: "owner"}]
                this.turn_context.add_power_context({name: "Action Selection", consequences, owner: creature})
                this.evaluate_consequences()
            }
        }
    }

    on_hover: OnPositionEvent = ({position}) => {
        if (this.selection_context?.type === "path_select" ||
            this.selection_context?.type === "area_burst_select" ||
            this.selection_context?.type === "position_select") {
            this.selection_context.on_hover(position)

            //TODO this is all very untidy
            this.battle_grid.creatures.map(creature => creature.visual.remove_hit_chance())

            const next_consequence = this.turn_context.get_current_context().peek_consequence()
            const needs_roll = next_consequence.type === "attack_roll"
                if (needs_roll) {
                    this.selection_context.available_targets.forEach(position => {

                        const attacker = next_consequence.attack
                        const attack = NODE.as_number_resolved(token_to_node({
                            token: attacker,
                            //TODO doing this here seems redundant if we already have player turn handler
                            context: this.turn_context.get_current_context(),
                            player_turn_handler: this
                        })).value

                        const defender = this.battle_grid.get_creature_by_position(position)
                        const defense = preview_defense({defender, defense_code: next_consequence.defense}).value

                        const chance = (attack + 20 - defense + 1) * 5

                        defender.display_hit_chance_on_hover({attack, defense, chance})
                    })
            }
        }
    }

    set_selected_indicator() {
        const creature = this.turn_context.get_current_context().owner()
        const cell = this.battle_grid.get_square(creature.data.position)
        cell.visual.setIndicator("selected")
    }

    deselect() {
        if (this.selection_context === null) return

        const square = this.battle_grid.get_square(this.selection_context.currently_selected.data.position)
        square.visual.clearIndicator()

        if (this.selection_context.type === "position_select") {
            this.clear_indicator_to_positions({positions: this.selection_context.available_targets})
            //TODO this need to be made better
            this.selection_context.available_targets
                .filter(this.battle_grid.is_terrain_occupied)
                .map(this.battle_grid.get_creature_by_position)
                .forEach(creature => creature.visual.remove_hit_chance())
        } else if (this.selection_context.type === "path_select") {
            this.clear_indicator_to_positions({positions: this.selection_context.available_targets})
            this.clear_indicator_to_positions({positions: this.selection_context.current_path})
        } else if (this.selection_context.type === "area_burst_select") {
            this.clear_indicator_to_positions({positions: this.selection_context.available_targets})
            this.clear_indicator_to_positions({positions: this.selection_context.affected_area})
            this.clear_indicator_to_positions({positions: this.selection_context.affected_targets})
        } else if (this.selection_context.type === "option_select") {
            this.selection_context.currently_selected.visual.remove_options()
        }

        this.selection_context = null
    }

    has_selected_creature = () => this.selection_context !== null

    get_in_range({targeting, origin, context}: {
        targeting: ConsequenceSelectTarget,
        origin: Position,
        context: PowerContext
    }) {
        if (targeting.targeting_type === "movement") {
            const distance = NODE.as_number_resolved(token_to_node({
                token: targeting.distance,
                context,
                player_turn_handler: this
            }))
            return get_move_area({origin, distance: distance.value, battle_grid: this.battle_grid})
        } else if (targeting.targeting_type === "melee_weapon") {
            return this.battle_grid.get_melee({origin})
        } else if (targeting.targeting_type === "adjacent") {
            return get_adjacent({position: origin, battle_grid: this.battle_grid})
        } else if (targeting.targeting_type === "ranged" || targeting.targeting_type === "area_burst") {
            const distance = token_to_node({token: targeting.distance, context, player_turn_handler: this})

            if (distance.type !== "number_resolved") throw "distance needs to be number resolved"
            return this.battle_grid.get_in_range({origin, distance: distance.value})
        }

        throw `Range "${JSON.stringify(targeting)}" not supported`
    }


    get_valid_targets = ({consequence, context}: { consequence: ConsequenceSelectTarget, context: PowerContext }) => {
        const in_range = this.get_in_range({
            targeting: consequence,
            origin: context.owner().data.position,
            context
        })

        if (consequence.targeting_type === "area_burst") return [context.owner().data.position, ...in_range]
        if (consequence.targeting_type === "movement") {
            const valid_targets = in_range.filter(position => !this.battle_grid.is_terrain_occupied(position))
            if (consequence.destination_requirement) {
                const node = token_to_node({
                    token: consequence.destination_requirement,
                    context,
                    player_turn_handler: this
                })
                const possibility = NODE.as_position(node)
                //TODO this needs to change how it works when we add big fellows
                return valid_targets.filter(position => positions_equal(position, possibility.value))
            } else
                return valid_targets
        }

        const valid_targets = in_range.filter(position => {
            if (consequence.target_type === "terrain")
                return !this.battle_grid.is_terrain_occupied(position)
            if (consequence.target_type === "enemy")
                return this.battle_grid.is_terrain_occupied(position)
            if (consequence.target_type === "creature")
                return this.battle_grid.is_terrain_occupied(position)

            throw `Target "${consequence.target_type}" not supported`
        })

        return valid_targets.filter(
            target => !consequence.exclude.some(
                excluded => positions_equal(context.get_creature(excluded).data.position, target)
            )
        )
    }

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
                action_log: this.action_log,
                turn_context: this.turn_context
            })
        }
    }

    set_indicator_to_positions = ({positions, indicator}: {
        positions: Array<Position>,
        indicator: Parameters<SquareVisual["setIndicator"]>[0]
    }) => {
        const squares = positions.map(this.battle_grid.get_square)
        squares.forEach(({visual}) => visual.setIndicator(indicator))
    }

    clear_indicator_to_positions = ({positions}: {
        positions: Array<Position>
    }) => {
        const squares = positions.map(this.battle_grid.get_square)
        squares.forEach(({visual}) => visual.clearIndicator())
    }
}
