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
import {create_turn_state, TurnState} from "scripts/battlegrid/player_turn_handler/TurnState";
import {
    interpret_instruction
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/interpret_instruction";
import {InitiativeOrder} from "scripts/initiative_order/InitiativeOrder";
import {EXPR} from "scripts/expressions/evaluator/EXPR";
import {get_creature_defense} from "scripts/character_sheet/get_creature_defense";
import {bound_minmax} from "scripts/ts_utils/bound_minmax";
import {SquareHighlight} from "scripts/battlegrid/squares/SquareHighlight";
import {
    ClickableCoordinate,
    get_position_by_coordinate,
    nullable_positions_equal
} from "scripts/battlegrid/coordinates/ClickableCoordinate";
import {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import {Expr} from "scripts/expressions/evaluator/types";
import {OptionButton, OptionButtons} from "scripts/battlegrid/option_buttons/OptionButtons";
import {AST} from "scripts/expressions/parser/AST_NODE";

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
    available_options: Array<OptionButton>
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

    let selection_context: PlayerTurnHandlerContextSelect | null = null

    const set_awaiting_position_selection = (context: Omit<PlayerTurnHandlerContextSelectPosition, "type">) => {
        //TODO AP3 this should be better on_hover
        selection_context = {type: "position_select", ...context}

        set_selected_indicator()

        transform_positions_to_f1(context.clickable)
            .map(battle_grid.get_square)
            .forEach(({visual}) => visual.set_highlight("available-target"))

        context.highlighted
            .forEach(({position, highlight}) => battle_grid.get_square(position).visual.set_highlight(highlight))
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
            for (const p of transform_positions_to_f1(selection_context.clickable))
                battle_grid.get_square(p).visual.set_highlight("available-target")
        }
    }

    const set_selected_indicator = () => {
        const position = turn_state.get_power_owner().data.position
        battle_grid.get_squares(position).forEach(({visual}) => visual.set_highlight("selected"))
    }

    const deselect = () => {
        if (selection_context === null) return

        const position = turn_state.get_power_owner().data.position
        battle_grid.get_squares(position).forEach(({visual}) => visual.set_highlight("none"))

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

    const clear_turn_state = () => {
        deselect()
        turn_state.clear()
    }

    function set_action_selection_for_current_character() {
        const instruction = {
            type: "add_powers_as_options",
            creature: AST.OWNER,
            cost: "normal",
            filter: "turn"
        } as const
        const owner = initiative_order.get_current_creature()
        turn_state.add_power_frame({name: "Action Selection", instructions: [instruction], owner})
    }

    const player_turn_handler: PlayerTurnHandler = {
        set_awaiting_position_selection,
        set_awaiting_option_selection,
        get_position_selection_context,
        get_position_selection_context_or_null,
        on_click,
        on_hover,
        set_selected_indicator,
        deselect,
        clear_turn_state,
        set_action_selection_for_current_character,
        //TODO extract instructions from player turn handler
        evaluate_instructions: () => {
        }
    }

    const evaluate_instructions = () => {
        while (selection_context === null) {
            const instruction = turn_state.next_instruction()

            if (instruction === null) {
                set_action_selection_for_current_character();
            } else {
                interpret_instruction({
                    instruction,
                    player_turn_handler,
                    battle_grid,
                    action_log,
                    turn_state,
                    evaluate_ast,
                    initiative_order
                })
            }
        }
    }
    player_turn_handler.evaluate_instructions = evaluate_instructions

    return player_turn_handler
}

export type PlayerTurnHandler = {
    set_awaiting_position_selection: (context: Omit<PlayerTurnHandlerContextSelectPosition, "type">) => void
    set_awaiting_option_selection: (context: Omit<PlayerTurnHandlerContextSelectOption, "type">) => void
    get_position_selection_context: () => PlayerTurnHandlerContextSelectPosition
    get_position_selection_context_or_null: () => PlayerTurnHandlerContextSelectPosition | null
    on_click: ({coordinate}: { coordinate: ClickableCoordinate }) => void
    on_hover: ({coordinate}: { coordinate: ClickableCoordinate | null }) => void
    set_selected_indicator: () => void
    deselect: () => void
    clear_turn_state: () => void
    set_action_selection_for_current_character: () => void
    evaluate_instructions: () => void
}

const show_attack_success_chance_if_needed = ({turn_state, selection_context, evaluate_ast}: {
    turn_state: TurnState,
    selection_context: PlayerTurnHandlerContextSelectPosition,
    evaluate_ast: (node: AstNode) => Expr
}) => {
    const next_instruction = turn_state.peek_instruction()
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