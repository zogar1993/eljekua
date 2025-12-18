import {BattleGrid} from "scripts/battlegrid/BattleGrid";
import {
    Position,
    PositionFootprintOne,
    positions_of_same_footprint_equal,
    transform_position_to_f1,
    transform_positions_to_f1
} from "scripts/battlegrid/Position";
import {ActionLog} from "scripts/action_log/ActionLog";
import {build_evaluate_ast} from "scripts/expressions/evaluator/evaluate_ast";
import {Creature} from "scripts/battlegrid/creatures/Creature";
import {Instruction} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";
import {create_turn_state, TurnState} from "scripts/battlegrid/player_turn_handler/TurnState";
import {
    interpret_instruction
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_instruction";
import {InitiativeOrder} from "scripts/initiative_order/InitiativeOrder";
import {CreatureData} from "scripts/battlegrid/creatures/CreatureData";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {get_creature_defense} from "scripts/character_sheet/get_creature_defense";
import {bound_minmax} from "scripts/math/minmax";
import {SquareHighlight} from "scripts/battlegrid/squares/SquareHighlight";
import {
    ClickableCoordinate,
    get_position_by_coordinate,
    nullable_positions_equal
} from "scripts/battlegrid/coordinates/ClickableCoordinate";
import {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import {Expr} from "scripts/expressions/evaluator/types";
import {ButtonOption, OptionButtons} from "scripts/battlegrid/OptionButtons";
import {ACTION_TYPE} from "scripts/battlegrid/creatures/ActionType";

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
                                               initiative_order,
                                               option_buttons
                                           }: {
    battle_grid: BattleGrid,
    action_log: ActionLog,
    initiative_order: InitiativeOrder,
    option_buttons: OptionButtons
}): PlayerTurnHandler => {
    const turn_state = create_turn_state()
    const evaluate_ast = build_evaluate_ast({battle_grid, turn_state})

    let started = false
    let selection_context: PlayerTurnHandlerContextSelect | null = null

    const set_awaiting_position_selection = (context: Omit<PlayerTurnHandlerContextSelectPosition, "type">) => {
        //TODO AP3 this should be better on_hover
        selection_context = {type: "position_select", ...context}

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
        selection_context = {type: "option_select", ...context}

        set_selected_indicator()

        const options = context.available_options.map(option => ({
            ...option,
            on_click: () => {
                option.on_click()
                deselect()
                evaluate_instructions()
            }
        }))

        option_buttons.display_options(options)
    }

    const get_position_selection_context = (): PlayerTurnHandlerContextSelectPosition => {
        if (selection_context?.type !== "position_select")
            throw Error("position_select selection_context not set")
        return selection_context
    }

    const get_position_selection_context_or_null = (): PlayerTurnHandlerContextSelectPosition | null => {
        if (selection_context?.type !== "position_select") return null
        return selection_context
    }


    const add_creature = (data: CreatureData) => {
        const creature = battle_grid.create_creature(data)
        initiative_order.add_creature(creature)
    }

    const start = () => {
        started = true
        initiative_order.start()
        const creature = initiative_order.get_current_creature()
        set_creature_as_current_turn(creature)
    }

    const set_creature_as_current_turn = (creature: Creature) => {
        const instructions: Array<Instruction> = [{type: "add_powers", creature: "owner"}]
        turn_state.add_power_frame({name: "Action Selection", instructions, owner: creature})
        evaluate_instructions()
    }

    const on_click = ({coordinate}: { coordinate: ClickableCoordinate }) => {
        if (selection_context?.type !== "position_select") return
        if (selection_context.target === null) return
        const position = get_position_by_coordinate({coordinate, positions: selection_context.clickable})
        if (position === null) return null;


        if (selection_context.target.type === "positions") {
            const path = selection_context.target.value
            if (!positions_of_same_footprint_equal(position, path[path.length - 1]))
                throw Error("position should be the end of the path")
        }

        turn_state.set_variable(selection_context.target_label,
            selection_context.target.type === "creatures" ? {
                type: selection_context.target.type,
                value: selection_context.target.value,
            } : {
                type: selection_context.target.type,
                value: selection_context.target.value,
                description: "target"
            })

        deselect()
        evaluate_instructions()
    }

    let latest_position: Position | null = null
    const on_hover = ({coordinate}: { coordinate: ClickableCoordinate | null }) => {
        if (selection_context?.type !== "position_select") return

        const position = coordinate &&
            get_position_by_coordinate({positions: selection_context.clickable, coordinate})

        if (nullable_positions_equal(latest_position, position)) return;
        latest_position = position

        const highlighted_positions = selection_context.highlighted.map(({position}) => position)

        for (const position of highlighted_positions) {
            battle_grid.get_square(position).visual.set_interaction_status("none")
            battle_grid.get_square(position).visual.set_highlight("none")
        }

        for (const creature of battle_grid.creatures)
            creature.visual.remove_hit_chance()

        selection_context = {...selection_context, highlighted: []}

        if (position) {
            selection_context.on_hover(position)
            show_attack_success_chance_if_needed({selection_context, evaluate_ast, turn_state})

            for (const p of transform_position_to_f1(position))
                battle_grid.get_square(p).visual.set_interaction_status("hover")
        } else {
            for (const position of transform_positions_to_f1(selection_context.clickable))
                battle_grid.get_square(position).visual.set_highlight("available-target")
        }
    }

    const set_selected_indicator = () => {
        const position = turn_state.get_power_owner().data.position
        set_highlight_to_position({position, highlight: "selected", battle_grid})
    }

    const deselect = () => {
        if (selection_context === null) return

        const position = turn_state.get_power_owner().data.position
        set_highlight_to_position({position, highlight: "none", battle_grid})

        if (selection_context.type === "position_select") {
            for (const position of transform_positions_to_f1(selection_context.clickable))
                battle_grid.get_square(position).visual.set_highlight("none")
            for (const position of selection_context.highlighted.map(({position}) => position))
                battle_grid.get_square(position).visual.set_highlight("none")

            if (selection_context.target) {
                if (selection_context.target.type === "creatures") {
                    const creatures = selection_context.target.value
                    creatures.forEach(creature => creature.visual.remove_hit_chance())
                }
            }
        } else if (selection_context.type === "option_select")
            option_buttons.remove_options()

        selection_context = null
    }

    const has_selected_creature = () => selection_context !== null

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
    }

    const evaluate_instructions = () => {
        while (!has_selected_creature()) {
            const instruction = turn_state.next_instruction()

            // Reached the end of all instructions
            if (instruction === null) {
                const ending_turn_creature = initiative_order.get_current_creature()


                for (const creature of battle_grid.creatures) {
                    creature.remove_statuses({type: "turn_end", creature: ending_turn_creature})
                }

                initiative_order.next_turn()
                const initiating_turn_creature = initiative_order.get_current_creature()

                for (const creature of battle_grid.creatures) {
                //TODO AP0 this excludes first turn
                    if (creature === initiating_turn_creature)
                        creature.set_available_actions([ACTION_TYPE.STANDARD, ACTION_TYPE.MOVEMENT, ACTION_TYPE.MOVEMENT])
                    else
                        creature.set_available_actions([ACTION_TYPE.OPPORTUNITY])

                    creature.remove_statuses({type: "turn_start", creature: initiating_turn_creature})

                    //TODO AP3 a little mutation but whatever, we can clean up later
                    for (const status of creature.statuses)
                        for (const duration of status.durations)
                            if (duration.until === "next_turn_end" && creature === duration.creature)
                                duration.until = "turn_end"
                }

                set_creature_as_current_turn(initiating_turn_creature)
                return
            }

            interpret_instruction({
                instruction,
                player_turn_handler,
                battle_grid,
                action_log,
                turn_state,
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
    on_click: ({coordinate}: { coordinate: ClickableCoordinate }) => void
    on_hover: ({coordinate}: { coordinate: ClickableCoordinate | null }) => void
    set_selected_indicator: () => void
    deselect: () => void
    has_selected_creature: () => boolean
}

//TODO AP3 standardize its usages and remove this
const set_highlight_to_position = ({position, highlight, battle_grid}: {
    position: Position,
    highlight: SquareHighlight,
    battle_grid: BattleGrid
}) => {
    transform_position_to_f1(position)
        .map(battle_grid.get_square)
        .forEach(({visual}) => visual.set_highlight(highlight))
}


const show_attack_success_chance_if_needed = ({turn_state, selection_context, evaluate_ast}: {
    turn_state: TurnState,
    selection_context: PlayerTurnHandlerContextSelectPosition,
    evaluate_ast: (node: AstNode) => Expr
}) => {
    const next_instruction = turn_state.get_current_power_frame().peek_instruction()
    const needs_roll = next_instruction.type === "attack_roll"
    if (needs_roll && selection_context.target) {
        if (selection_context.target.type !== "creatures")
            throw Error("an attack roll needs to target creatures")

        const creatures = selection_context.target.value
        creatures.forEach(defender => {
            const attacker = next_instruction.attack
            const attack = EXPR.as_number(evaluate_ast(attacker))

            const defense_code = next_instruction.defense
            const defense = get_creature_defense({creature: defender, defense_code}).value

            const chance = bound_minmax(0, (attack + 20 - defense + 1) * 5, 100)

            defender.visual.display_hit_chance({attack, defense, chance})
        })
    }
}
