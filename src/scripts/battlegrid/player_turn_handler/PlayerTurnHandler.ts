import {BattleGrid} from "scripts/battlegrid/BattleGrid";
import {
    Position, PositionFootprintOne,
    positions_of_same_footprint_equal,
    positions_share_surface,
    transform_position_to_footprint_one
} from "scripts/battlegrid/Position";
import {ActionLog} from "scripts/action_log/ActionLog";
import {build_evaluate_token} from "scripts/expressions/token_evaluator/evaluate_token";
import {Creature} from "scripts/battlegrid/creatures/Creature";
import {
    Instruction,
    InstructionSelectTarget
} from "scripts/expressions/tokenizer/transform_power_ir_into_vm_representation";
import {PowerContext} from "scripts/battlegrid/player_turn_handler/PowerContext";
import {TurnContext} from "scripts/battlegrid/player_turn_handler/TurnContext";
import {
    interpret_instruction
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_instruction";
import {SquareVisual} from "scripts/battlegrid/squares/SquareVisual";
import {ButtonOption} from "scripts/battlegrid/creatures/CreatureVisual";
import {InitiativeOrder} from "scripts/initiative_order/InitiativeOrder";
import {CreatureData} from "scripts/battlegrid/creatures/CreatureData";
import {NODE} from "scripts/expressions/token_evaluator/NODE";
import {AstNode} from "scripts/expressions/token_evaluator/types";
import {get_reach} from "scripts/battlegrid/ranges/get_reach";
import {get_creature_defense} from "scripts/character_sheet/get_creature_defense";
import {bound_minmax} from "scripts/math/minmax";
import {SquareHighlight} from "scripts/battlegrid/squares/SquareHighlight";

type HighlightedPosition = { position: PositionFootprintOne, highlight: SquareHighlight }

type PlayerTurnHandlerContextSelect =
    PlayerTurnHandlerContextSelectPosition
    | PlayerTurnHandlerContextSelectOption

export type PlayerTurnHandlerContextSelectPosition = {
    type: "position_select"
    owner: Creature
    clickable: Array<Position>
    highlighted: Array<HighlightedPosition>
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
    battle_grid: BattleGrid
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
        //TODO P3 this should be better on_hover
        this.selection_context = {
            type: "position_select",
            owner,
            ...context
        }

        this.set_selected_indicator()

        context.clickable.forEach(position => this.set_highlight_to_position(position, "available-target"))
        context.highlighted.forEach(({position, highlight}) => this.set_highlight_to_position(position, highlight))
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

    set_creature_as_current_turn(creature: Creature) {
        const instructions: Array<Instruction> = [{type: "add_powers", creature: "owner"}]
        this.turn_context.add_power_context({name: "Action Selection", instructions, owner: creature})
        this.evaluate_instructions()
    }

    on_click = ({position}: { position: Position }) => {
        //TODO P0 big fellows break when moving to the edge of their movement
        if (this.selection_context?.type === "position_select") {
            if (this.selection_context.clickable.some(p => positions_share_surface(p, position))) {
                this.selection_context.on_click(position)
                this.deselect()
                this.evaluate_instructions()
            }
        }
    }

    on_hover = ({position}: { position: Position | null }) => {
        if (this.selection_context?.type === "position_select") {
            if (position) {
                if (!this.selection_context.clickable.some(c => positions_of_same_footprint_equal(position, c))) return

                //TODO P3 this breaks the chance of hitting, where the chance stays on screen
                clean_highlighted_status(this)

                this.selection_context.on_hover(position)

                //TODO P3 this is all very untidy
                const next_instruction = this.turn_context.get_current_context().peek_instruction()
                const needs_roll = next_instruction.type === "attack_roll"
                if (needs_roll && this.selection_context.target) {
                    NODE.as_creatures(this.selection_context.target).forEach(defender => {
                        const attacker = next_instruction.attack
                        const attack = NODE.as_number_resolved(this.evaluate_token(attacker)).value

                        const defense_code = next_instruction.defense
                        const defense = get_creature_defense({creature: defender, defense_code}).value

                        const chance = bound_minmax(0, (attack + 20 - defense + 1) * 5, 100)

                        defender.visual.display_hit_chance({attack, defense, chance})
                    })
                }

                //TODO P1 this line is wrong on many levels, but it gets us out of the way to test hovering
                this.set_interaction_status_to_positions(this.battle_grid.board.flatMap(x => x).map(x => x.position), "none")
                this.set_interaction_status_to_positions(transform_position_to_footprint_one(position), "hover")
            } else {
                //TODO P2 WIP remove indicators from creatures and tiles when you go out of the selectable space
                this.battle_grid.creatures.map(creature => creature.visual.remove_hit_chance())
                this.selection_context.highlighted.forEach(({position}) => this.set_highlight_to_position(position, "none"))

            }
        }
    }

    set_selected_indicator() {
        const creature = this.turn_context.get_current_context().owner()
        this.set_highlight_to_position(creature.data.position, "selected")
    }

    deselect() {
        if (this.selection_context === null) return

        this.set_highlight_to_position(this.selection_context.owner.data.position, "none")

        if (this.selection_context.type === "position_select") {
            this.selection_context.clickable.forEach(position => this.set_highlight_to_position(position, "none"))
            this.selection_context.highlighted.forEach(({position}) => this.set_highlight_to_position(position, "none"))

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
                //TODO P3 move targeting and these evaluate token functions outside of the player turn handler
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
                excluded => positions_of_same_footprint_equal(context.get_creature(excluded).data.position, target)
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
                    creature.remove_statuses({type: "turn_end", creature: ending_turn_creature})
                })

                this.initiative_order.next_turn()
                const initiating_turn_creature = this.initiative_order.get_current_creature()

                for (const creature of this.battle_grid.creatures) {
                    creature.remove_statuses({type: "turn_start", creature: initiating_turn_creature})

                    //TODO P3 a little mutation but whatever, we can clean up later
                    for (const status of creature.statuses)
                        for (const duration of status.durations)
                            if (duration.until === "next_turn_end" && creature === duration.creature)
                                duration.until = "turn_end"
                }

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

    set_highlight_to_position = (position: Position, highlight: SquareHighlight) => {
        transform_position_to_footprint_one(position)
            .map(this.battle_grid.get_square)
            .forEach(({visual}) => visual.set_highlight(highlight))
    }

    set_interaction_status_to_positions = (positions: Array<PositionFootprintOne>, value: Parameters<SquareVisual["set_interaction_status"]>[0]) => {
        positions
            .map(this.battle_grid.get_square)
            .forEach(({visual}) => visual.set_interaction_status(value))
    }
}

const clean_highlighted_status = (player_turn_handler: PlayerTurnHandler) => {
    //TODO P3 we should receive the selection context from a param
    if (player_turn_handler.selection_context?.type !== "position_select") throw Error("position should be position_select")
    const highlighted_positions = player_turn_handler.selection_context?.highlighted.map(({position}) => position)
    player_turn_handler.set_interaction_status_to_positions(highlighted_positions, "none")
    player_turn_handler.battle_grid.get_creatures_in_positions(highlighted_positions).forEach(creature => creature.visual.remove_hit_chance())
}
