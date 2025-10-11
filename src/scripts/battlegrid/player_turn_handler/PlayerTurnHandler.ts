import {BattleGrid, transform_position_to_footprint_one} from "scripts/battlegrid/BattleGrid";
import {
    OnPositionEvent,
    Position,
    positions_equal,
    positions_share_surface
} from "scripts/battlegrid/Position";
import {ActionLog} from "scripts/action_log/ActionLog";
import {build_evaluate_token} from "scripts/expressions/token_evaluator/evaluate_token";
import {Creature} from "scripts/battlegrid/creatures/Creature";
import {Instruction, InstructionSelectTarget} from "scripts/expressions/tokenizer/transform_power_ir_into_vm_representation";
import {PowerContext} from "scripts/battlegrid/player_turn_handler/PowerContext";
import {TurnContext} from "scripts/battlegrid/player_turn_handler/TurnContext";
import {interpret_instruction} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_instruction";
import {SquareVisual} from "scripts/battlegrid/squares/SquareVisual";
import {ButtonOption} from "scripts/battlegrid/creatures/CreatureVisual";
import {InitiativeOrder} from "scripts/initiative_order/InitiativeOrder";
import {CreatureData} from "scripts/battlegrid/creatures/CreatureData";
import {NODE} from "scripts/expressions/token_evaluator/NODE";
import {preview_defense} from "scripts/expressions/token_evaluator/internals/keyword/evaluate_keyword";
import {AstNode} from "scripts/expressions/token_evaluator/types";
import {get_reach} from "scripts/battlegrid/ranges/get_reach";

type PlayerTurnHandlerContextSelect =
    PlayerTurnHandlerContextSelectPosition
    | PlayerTurnHandlerContextSelectOption

export type PlayerTurnHandlerContextSelectPosition = {
    type: "position_select"
    owner: Creature
    clickable: Array<Position>
    highlighted_area: Array<Position>
    target: AstNode | null
    on_click: (position: Position) => void
    on_hover: (position: Position) => void
    footprint: number
}

type PlayerTurnHandlerContextSelectOption = {
    type: "option_select"
    owner: Creature
    available_options: Array<ButtonOption>
}

export class PlayerTurnHandler {
    private readonly action_log: ActionLog
    private readonly battle_grid: BattleGrid
    turn_context = new TurnContext()
    initiative_order: InitiativeOrder
    evaluate_token = build_evaluate_token({player_turn_handler: this})
    started = false

    selection_context: PlayerTurnHandlerContextSelect | null = null

    constructor({battle_grid, action_log, initiative_order}: {
        battle_grid: BattleGrid,
        action_log: ActionLog,
        initiative_order: InitiativeOrder
    }) {
        this.battle_grid = battle_grid
        this.action_log = action_log
        this.initiative_order = initiative_order
    }

    set_awaiting_position_selection = (context: Omit<PlayerTurnHandlerContextSelectPosition, "type" | "owner">) => {
        const owner = this.turn_context.get_current_context().owner()
        //TODO this should be better on_hover
        this.selection_context = {
            type: "position_select",
            owner,
            ...context
        }

        this.set_selected_indicator()

        this.set_indicator_to_positions({positions: context.clickable, indicator: "available-target"})
        this.set_indicator_to_positions({positions: context.highlighted_area, indicator: "current-path"})
        //this.set_indicator_to_positions({positions: context.affected_area, indicator: "area"})
    }

    set_awaiting_option_selection = (context: Omit<PlayerTurnHandlerContextSelectOption, "type" | "owner">) => {
        const owner = this.turn_context.get_current_context().owner()
        this.selection_context = {type: "option_select", owner, ...context}

        this.set_selected_indicator()

        const options = context.available_options.map(option => ({
            ...option,
            on_click: () => {
                option.on_click()
                this.deselect()
                this.evaluate_instructions()
            }
        }))
        owner.visual.display_options(options)
    }

    add_creature = (data: CreatureData) => {
        const creature = this.battle_grid.create_creature(data)
        this.initiative_order.add_creature(creature)
    }

    start = () => {
        this.started = true
        this.initiative_order.start()
        const creature = this.initiative_order.get_current_creature()
        this.set_creature_as_current_turn(creature)
    }

    on_click: OnPositionEvent = ({position}) => {
        if (this.selection_context?.type === "position_select") {
            if (this.selection_context.clickable.some(p => positions_share_surface(p, position))) {
                this.selection_context.on_click(position)
                this.deselect()
                this.evaluate_instructions()
            }
        }
    }

    set_creature_as_current_turn(creature: Creature) {
        const instructions: Array<Instruction> = [{type: "add_powers", creature: "owner"}]
        this.turn_context.add_power_context({name: "Action Selection", instructions, owner: creature})
        this.evaluate_instructions()
    }

    on_hover: OnPositionEvent = ({position}) => {
        if (this.selection_context?.type === "position_select") {
            this.selection_context.on_hover(position)

            //TODO this is all very untidy
            this.battle_grid.creatures.map(creature => creature.visual.remove_hit_chance())

            const next_instruction = this.turn_context.get_current_context().peek_instruction()
            const needs_roll = next_instruction.type === "attack_roll"
            if (needs_roll && this.selection_context.target) {
                NODE.as_creatures(this.selection_context.target).forEach(defender => {

                    const attacker = next_instruction.attack
                    const attack = NODE.as_number_resolved(this.evaluate_token(attacker)).value

                    const defense = preview_defense({defender, defense_code: next_instruction.defense}).value

                    const chance = (attack + 20 - defense + 1) * 5

                    defender.display_hit_chance_on_hover({attack, defense, chance})
                })
            }
        }
    }

    set_selected_indicator() {
        const creature = this.turn_context.get_current_context().owner()
        const positions = transform_position_to_footprint_one(creature.data.position)

        for (const position of positions) {
            const cell = this.battle_grid.get_square(position)
            cell.visual.setIndicator("selected")
        }
    }

    deselect() {
        if (this.selection_context === null) return

        transform_position_to_footprint_one(this.selection_context.owner.data.position)
            .map(this.battle_grid.get_square)
            .forEach(({visual}) => visual.clearIndicator())

        if (this.selection_context.type === "position_select") {
            this.clear_indicator_to_positions({positions: this.selection_context.clickable})
            this.clear_indicator_to_positions({positions: this.selection_context.highlighted_area})

            if (this.selection_context.target) {
                if (this.selection_context.target.type === "creature"
                    || this.selection_context.target.type === "creatures") {
                    const creatures = NODE.as_creatures(this.selection_context.target)
                    creatures.forEach(creature => creature.visual.remove_hit_chance())
                }
            }
        } else if (this.selection_context.type === "option_select") {
            this.selection_context.owner.visual.remove_options()
        }

        this.selection_context = null
    }

    has_selected_creature = () => this.selection_context !== null

    get_valid_targets = ({instruction, context}: { instruction: InstructionSelectTarget, context: PowerContext }) => {
        const in_range = get_reach({
            instruction: instruction,
            origin: context.owner().data.position,
            battle_grid: this.battle_grid,
            evaluate_token: this.evaluate_token
        })

        if (instruction.targeting_type === "area_burst")
            return in_range

        if (instruction.targeting_type === "push")
            return in_range

        if (instruction.targeting_type === "movement") {
            const valid_targets = in_range.filter(position => !this.battle_grid.is_terrain_occupied(position))
            if (instruction.destination_requirement) {
                //TODO move targeting and these evaluate token functions outside of the player turn handler
                const possibilities = NODE.as_positions(this.evaluate_token(instruction.destination_requirement)).value

                const restricted: Array<Position> = []
                for (const position of valid_targets)
                    for (const possibility of possibilities)
                        if (positions_share_surface(position, possibility))
                            restricted.push(position)
                return restricted
            } else
                return valid_targets
        }

        const valid_targets = in_range.filter(position => {
            if (instruction.target_type === "terrain")
                return !this.battle_grid.is_terrain_occupied(position)
            if (instruction.target_type === "enemy")
                return this.battle_grid.is_terrain_occupied(position)
            if (instruction.target_type === "creature")
                return this.battle_grid.is_terrain_occupied(position)

            throw `Target "${instruction.target_type}" not supported`
        })

        return valid_targets.filter(
            target => !instruction.exclude.some(
                excluded => positions_equal(context.get_creature(excluded).data.position, target)
            )
        )
    }

    evaluate_instructions = () => {
        while (!this.has_selected_creature()) {
            const instruction = this.turn_context.next_instruction()

            // Reached the end of all instructions
            if (instruction === null) {
                const ending_turn_creature = this.initiative_order.get_current_creature()

                this.battle_grid.creatures.forEach(creature => {
                    //exclude the ones that expire on this turn end
                    creature.remove_statuses(({until, creature, bypass_this_turn}) =>
                        until === "turn_end" && !bypass_this_turn && creature === ending_turn_creature)

                    // this is so that "end of next turn" durations exclude current turn, but are removed next turn
                    for (const status of creature.statuses)
                        for (const duration of status.durations)
                            if (duration.until === "turn_end" && creature === ending_turn_creature)
                                duration.bypass_this_turn = false
                })

                this.initiative_order.next_turn()
                const initiating_turn_creature = this.initiative_order.get_current_creature()

                this.battle_grid.creatures.forEach(creature => {
                    //exclude the ones that expire on this turn start
                    creature.remove_statuses(({until, creature}) =>
                        until === "turn_start" &&
                        (creature === initiating_turn_creature || creature === undefined)
                    )
                })

                this.set_creature_as_current_turn(initiating_turn_creature)
                return
            }

            const context = this.turn_context.get_current_context()

            interpret_instruction({
                instruction,
                context,
                player_turn_handler: this,
                battle_grid: this.battle_grid,
                action_log: this.action_log,
                turn_context: this.turn_context,
                evaluate_token: this.evaluate_token
            })
        }
    }

    set_indicator_to_positions = ({positions, indicator}: {
        positions: Array<Position>,
        indicator: Parameters<SquareVisual["setIndicator"]>[0]
    }) => {
        //TODO can be redundant
        positions
            .flatMap(transform_position_to_footprint_one)
            .map(this.battle_grid.get_square)
            .forEach(({visual}) => visual.setIndicator(indicator))
    }

    clear_indicator_to_positions = ({positions}: {
        positions: Array<Position>
    }) => {
        //TODO can be redundant
        positions
            .flatMap(transform_position_to_footprint_one)
            .map(this.battle_grid.get_square)
            .forEach(({visual}) => visual.clearIndicator())
    }
}
