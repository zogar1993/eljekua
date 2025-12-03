import {BattleGrid} from "scripts/battlegrid/BattleGrid";
import {
    Position, PositionFootprintOne,
    positions_of_same_footprint_equal,
    positions_share_surface,
    transform_position_to_f1, transform_positions_to_f1
} from "scripts/battlegrid/Position";
import {ActionLog} from "scripts/action_log/ActionLog";
import {build_evaluate_ast} from "scripts/expressions/evaluator/evaluate_ast";
import {Creature} from "scripts/battlegrid/creatures/Creature";
import {
    Instruction,
    InstructionSelectTarget
} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";
import {PowerContext} from "scripts/battlegrid/player_turn_handler/PowerContext";
import {TurnContext} from "scripts/battlegrid/player_turn_handler/TurnContext";
import {
    interpret_instruction
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_instruction";
import {ButtonOption} from "scripts/battlegrid/creatures/CreatureVisual";
import {InitiativeOrder} from "scripts/initiative_order/InitiativeOrder";
import {CreatureData} from "scripts/battlegrid/creatures/CreatureData";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {get_reach} from "scripts/battlegrid/position/get_reach";
import {get_creature_defense} from "scripts/character_sheet/get_creature_defense";
import {bound_minmax} from "scripts/math/minmax";
import {SquareHighlight} from "scripts/battlegrid/squares/SquareHighlight";
import {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import {Expr} from "scripts/expressions/evaluator/types";

type HighlightedPosition = { position: PositionFootprintOne, highlight: SquareHighlight }

type PlayerTurnHandlerContextSelect =
    PlayerTurnHandlerContextSelectPosition
    | PlayerTurnHandlerContextSelectOption

export type PlayerTurnHandlerContextSelectPosition = {
    type: "position_select"
    clickable: Array<Position>
    highlighted: Array<HighlightedPosition>
    target: { type: "creatures", value: Array<Creature> } | { type: "positions", value: Array<Position> } | null
    target_label: string
    on_hover: (position: Position) => void
    footprint: number
}

type PlayerTurnHandlerContextSelectOption = {
    type: "option_select"
    available_options: Array<ButtonOption>
}

export const create_player_turn_handler = ({
                                               battle_grid,
                                               action_log,
                                               initiative_order
                                           }: {
    battle_grid: BattleGrid,
    action_log: ActionLog,
    initiative_order: InitiativeOrder
}): PlayerTurnHandler => {
    const turn_context = new TurnContext()
    const evaluate_ast = build_evaluate_ast({battle_grid, turn_context})
    //TODO P3 there is probably better naming for this
    const self = {
        started: false,
        selection_context: null as PlayerTurnHandlerContextSelect | null
    }

    const set_awaiting_position_selection = (context: Omit<PlayerTurnHandlerContextSelectPosition, "type">) => {
        //TODO P3 this should be better on_hover
        self.selection_context = {type: "position_select", ...context}

        set_selected_indicator()

        context.clickable.forEach(position => set_highlight_to_position({
            position,
            highlight: "available-target",
            battle_grid
        }))
        context.highlighted.forEach(({position, highlight}) => set_highlight_to_position({
            position,
            highlight,
            battle_grid
        }))
    }

    const set_awaiting_option_selection = (context: Omit<PlayerTurnHandlerContextSelectOption, "type">) => {
        const owner = turn_context.get_current_context().owner()
        self.selection_context = {type: "option_select", ...context}

        set_selected_indicator()

        const options = context.available_options.map(option => ({
            ...option,
            on_click: () => {
                option.on_click()
                deselect()
                evaluate_instructions()
            }
        }))
        //TODO P4 move display options outside of the character visual
        owner.visual.display_options(options)
    }

    const get_position_selection_context = (): PlayerTurnHandlerContextSelectPosition => {
        if (self.selection_context?.type !== "position_select")
            throw Error("position_select selection_context not set")
        return self.selection_context
    }

    const get_position_selection_context_or_null = (): PlayerTurnHandlerContextSelectPosition | null => {
        if (self.selection_context?.type !== "position_select") return null
        return self.selection_context
    }


    const add_creature = (data: CreatureData) => {
        const creature = battle_grid.create_creature(data)
        initiative_order.add_creature(creature)
    }

    const start = () => {
        self.started = true
        initiative_order.start()
        const creature = initiative_order.get_current_creature()
        set_creature_as_current_turn(creature)
    }

    const set_creature_as_current_turn = (creature: Creature) => {
        const instructions: Array<Instruction> = [{type: "add_powers", creature: "owner"}]
        turn_context.add_power_context({name: "Action Selection", instructions, owner: creature})
        evaluate_instructions()
    }

    const on_click = ({position}: { position: Position }) => {
        //TODO P0 big fellows break when moving to the edge of their movement
        if (self.selection_context?.type !== "position_select") return
        if (self.selection_context.target === null) return

        if (self.selection_context.target.type === "positions") {
            const path = self.selection_context.target.value
            if (!positions_of_same_footprint_equal(position, path[path.length - 1]))
                throw Error("position should be the end of the path")
        }

        const power_context = turn_context.get_current_context()
        power_context.set_variable(self.selection_context.target_label,
            self.selection_context.target.type === "creatures" ? {
                type: self.selection_context.target.type,
                value: self.selection_context.target.value,
                description: "target"
            } : {
                type: self.selection_context.target.type,
                value: self.selection_context.target.value,
                description: "target"
            })

        deselect()
        evaluate_instructions()
    }


    const on_hover = ({position}: { position: Position | null }) => {
        if (self.selection_context?.type === "position_select") {
            //TODO P2 remove indicators from creatures and tiles when you go out of the selectable space

            const highlighted_positions = self.selection_context.highlighted.map(({position}) => position)

            for (const position of highlighted_positions) {
                battle_grid.get_square(position).visual.set_interaction_status("none")
                battle_grid.get_square(position).visual.set_highlight("none")
            }

            for (const creature of battle_grid.creatures)
                creature.visual.remove_hit_chance()

            self.selection_context = {...self.selection_context, highlighted: []}

            if (
                position &&
                self.selection_context.clickable.some(c => positions_of_same_footprint_equal(position, c))
            ) {
                self.selection_context.on_hover(position)

                //TODO P3 this is all very untidy
                const next_instruction = turn_context.get_current_context().peek_instruction()
                const needs_roll = next_instruction.type === "attack_roll"
                if (needs_roll && self.selection_context.target) {
                    if (self.selection_context.target.type !== "creatures")
                        throw Error("an attack roll needs to target creatures")

                    const creatures = self.selection_context.target.value
                    creatures.forEach(defender => {
                        const attacker = next_instruction.attack
                        const attack = EXPR.as_number(evaluate_ast(attacker))

                        const defense_code = next_instruction.defense
                        const defense = get_creature_defense({creature: defender, defense_code}).value

                        const chance = bound_minmax(0, (attack + 20 - defense + 1) * 5, 100)

                        defender.visual.display_hit_chance({attack, defense, chance})
                    })
                }

                for (const p of transform_position_to_f1(position))
                    battle_grid.get_square(p).visual.set_interaction_status("hover")

            } else {
                for (const position of transform_positions_to_f1(self.selection_context.clickable))
                    battle_grid.get_square(position).visual.set_highlight("available-target")
            }
        }
    }

    const set_selected_indicator = () => {
        const creature = turn_context.get_current_context().owner()
        set_highlight_to_position({
            position: creature.data.position,
            highlight: "selected",
            battle_grid
        })
    }

    const deselect = () => {
        if (self.selection_context === null) return

        set_highlight_to_position({
            position: turn_context.get_current_context().owner().data.position,
            highlight: "none",
            battle_grid
        })

        if (self.selection_context.type === "position_select") {
            for (const position of transform_positions_to_f1(self.selection_context.clickable))
                battle_grid.get_square(position).visual.set_highlight("none")
            for (const position of self.selection_context.highlighted.map(({position}) => position))
                battle_grid.get_square(position).visual.set_highlight("none")

            if (self.selection_context.target) {
                if (self.selection_context.target.type === "creatures") {
                    const creatures = self.selection_context.target.value
                    creatures.forEach(creature => creature.visual.remove_hit_chance())
                }
            }
        } else if (self.selection_context.type === "option_select") {
            turn_context.get_current_context().owner().visual.remove_options()
        }

        self.selection_context = null
    }

    const has_selected_creature = () => self.selection_context !== null

    const player_turn_handler: PlayerTurnHandler = {
        set_awaiting_position_selection,
        set_awaiting_option_selection,
        get_position_selection_context,
        get_position_selection_context_or_null,
        add_creature,
        start,
        set_creature_as_current_turn,
        on_click,
        on_hover,
        set_selected_indicator,
        deselect,
        has_selected_creature,

        turn_context,
    }

    const evaluate_instructions = () => {
        while (!has_selected_creature()) {
            const instruction = turn_context.next_instruction()

            // Reached the end of all instructions
            if (instruction === null) {
                const ending_turn_creature = initiative_order.get_current_creature()

                battle_grid.creatures.forEach(creature => {
                    creature.remove_statuses({type: "turn_end", creature: ending_turn_creature})
                })

                initiative_order.next_turn()
                const initiating_turn_creature = initiative_order.get_current_creature()

                for (const creature of battle_grid.creatures) {
                    creature.remove_statuses({type: "turn_start", creature: initiating_turn_creature})

                    //TODO P3 a little mutation but whatever, we can clean up later
                    for (const status of creature.statuses)
                        for (const duration of status.durations)
                            if (duration.until === "next_turn_end" && creature === duration.creature)
                                duration.until = "turn_end"
                }

                set_creature_as_current_turn(initiating_turn_creature)
                return
            }

            const context = turn_context.get_current_context()

            interpret_instruction({
                instruction,
                context,
                player_turn_handler,
                battle_grid,
                action_log,
                turn_context,
                evaluate_ast
            })
        }
    }

    return player_turn_handler
}

export type PlayerTurnHandler = {
    set_awaiting_position_selection: (context: Omit<PlayerTurnHandlerContextSelectPosition, "type">) => void
    set_awaiting_option_selection: (context: Omit<PlayerTurnHandlerContextSelectOption, "type">) => void
    get_position_selection_context: () => PlayerTurnHandlerContextSelectPosition
    get_position_selection_context_or_null: () => PlayerTurnHandlerContextSelectPosition | null
    add_creature: (data: CreatureData) => void
    start: () => void
    set_creature_as_current_turn: (creature: Creature) => void
    on_click: ({position}: { position: Position }) => void
    on_hover: ({position}: { position: Position | null }) => void
    set_selected_indicator: () => void
    deselect: () => void
    has_selected_creature: () => boolean
    turn_context: TurnContext
}

//TODO P3 standardize its usages and remove this
const set_highlight_to_position = ({position, highlight, battle_grid}: {
    position: Position,
    highlight: SquareHighlight,
    battle_grid: BattleGrid
}) => {
    transform_position_to_f1(position)
        .map(battle_grid.get_square)
        .forEach(({visual}) => visual.set_highlight(highlight))
}
