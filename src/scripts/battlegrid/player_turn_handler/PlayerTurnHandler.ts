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
    target: { type: "creatures", value: Array<Creature> } | { type: "positions", value: Array<Position> } | null
    target_label: string
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

        context.clickable.forEach(position => set_highlight_to_position({
            position,
            highlight: "available-target",
            battle_grid: this.battle_grid
        }))
        context.highlighted.forEach(({position, highlight}) => set_highlight_to_position({
            position,
            highlight,
            battle_grid: this.battle_grid
        }))
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

    get_position_selection_context = (): PlayerTurnHandlerContextSelectPosition => {
        const selection = this.selection_context
        if (selection?.type !== "position_select")
            throw Error("position_select selection_context not set")
        return selection
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
        const selection = this.selection_context
        if (selection?.type !== "position_select") return
        if (selection.target === null) return

        if (selection.target.type === "positions") {
            const path = selection.target.value
            if (!positions_of_same_footprint_equal(position, path[path.length - 1]))
                throw Error("position should be the end of the path")
        }

        const power_context = this.turn_context.get_current_context()
        power_context.set_variable(selection.target_label,
            selection.target.type === "creatures" ? {
                type: selection.target.type,
                value: selection.target.value,
                description: "target"
            } : {
                type: selection.target.type,
                value: selection.target.value,
                description: "target"
            })

        this.deselect()
        this.evaluate_instructions()

    }


    on_hover = ({position}: { position: Position | null }) => {
        if (this.selection_context?.type === "position_select") {
            if (position) {
                if (!this.selection_context.clickable.some(c => positions_of_same_footprint_equal(position, c))) return

                //TODO P3 this breaks the chance of hitting, where the chance stays on screen
                clean_highlighted_status({selection_context: this.selection_context, battle_grid: this.battle_grid})

                this.selection_context.on_hover(position)

                //TODO P3 this is all very untidy
                const next_instruction = this.turn_context.get_current_context().peek_instruction()
                const needs_roll = next_instruction.type === "attack_roll"
                if (needs_roll && this.selection_context.target) {
                    if (this.selection_context.target.type !== "creatures")
                        throw Error("an attack roll needs to target creatures")

                    const creatures = this.selection_context.target.value
                    creatures.forEach(defender => {
                        const attacker = next_instruction.attack
                        const attack = NODE.as_number_resolved(this.evaluate_token(attacker)).value

                        const defense_code = next_instruction.defense
                        const defense = get_creature_defense({creature: defender, defense_code}).value

                        const chance = bound_minmax(0, (attack + 20 - defense + 1) * 5, 100)

                        defender.visual.display_hit_chance({attack, defense, chance})
                    })
                }

                //TODO P1 this line is wrong on many levels, but it gets us out of the way to test hovering
                set_interaction_status_to_positions({
                    positions: this.battle_grid.board.flatMap(x => x).map(x => x.position),
                    value: "none",
                    battle_grid: this.battle_grid
                })
                set_interaction_status_to_positions({
                    positions: transform_position_to_footprint_one(position),
                    value: "hover",
                    battle_grid: this.battle_grid
                })
            } else {
                //TODO P2 WIP remove indicators from creatures and tiles when you go out of the selectable space
                this.battle_grid.creatures.map(creature => creature.visual.remove_hit_chance())
                this.selection_context.highlighted.forEach(({position}) => set_highlight_to_position({
                    position,
                    highlight: "none",
                    battle_grid: this.battle_grid
                }))

            }
        }
    }

    set_selected_indicator() {
        const creature = this.turn_context.get_current_context().owner()
        set_highlight_to_position({
            position: creature.data.position,
            highlight: "selected",
            battle_grid: this.battle_grid
        })
    }

    deselect() {
        if (this.selection_context === null) return

        set_highlight_to_position({
            position: this.selection_context.owner.data.position,
            highlight: "none",
            battle_grid: this.battle_grid
        })

        if (this.selection_context.type === "position_select") {
            this.selection_context.clickable.forEach(position => set_highlight_to_position({
                position,
                highlight: "none",
                battle_grid: this.battle_grid
            }))
            this.selection_context.highlighted.forEach(({position}) => set_highlight_to_position({
                position,
                highlight: "none",
                battle_grid: this.battle_grid
            }))

            if (this.selection_context.target) {
                if (this.selection_context.target.type === "creatures") {
                    const creatures = this.selection_context.target.value
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
                const possibilities = NODE.as_positions(this.evaluate_token(instruction.destination_requirement))

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
                //TODO P3 this one feels fishy
                excluded => positions_of_same_footprint_equal(NODE.as_creature(context.get_variable(excluded)).data.position, target)
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
}

const clean_highlighted_status = ({selection_context, battle_grid}: {
    selection_context: PlayerTurnHandlerContextSelectPosition,
    battle_grid: BattleGrid
}) => {
    const highlighted_positions = selection_context.highlighted.map(({position}) => position)
    set_interaction_status_to_positions({positions: highlighted_positions, value: "none", battle_grid})
    battle_grid.get_creatures_in_positions(highlighted_positions).forEach(creature => creature.visual.remove_hit_chance())
}

const set_interaction_status_to_positions = ({positions, value, battle_grid}: {
    positions: Array<PositionFootprintOne>,
    value: Parameters<SquareVisual["set_interaction_status"]>[0],
    battle_grid: BattleGrid
}) => {
    positions
        .map(battle_grid.get_square)
        .forEach(({visual}) => visual.set_interaction_status(value))
}

const set_highlight_to_position = ({position, highlight, battle_grid}: {
    position: Position,
    highlight: SquareHighlight,
    battle_grid: BattleGrid
}) => {
    transform_position_to_footprint_one(position)
        .map(battle_grid.get_square)
        .forEach(({visual}) => visual.set_highlight(highlight))
}