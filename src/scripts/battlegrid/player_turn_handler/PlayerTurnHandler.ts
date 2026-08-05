import {BattleGrid} from "scripts/battlegrid/BattleGrid";
import {
    Position,
    PositionFootprintOne,
    positions_of_same_footprint_equal,
    transform_position_to_f1,
    transform_positions_to_f1
} from "scripts/battlegrid/Position";
import {Creature} from "scripts/battlegrid/creatures/Creature";
import {TurnState} from "scripts/battlegrid/player_turn_handler/TurnState";
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
import {INSTRUCTION_TYPE} from "scripts/expressions/parser/instructions";
import {HitStatusButtons} from "scripts/battlegrid/hit_status_buttons/HitStatusButtons";
import {HitStatus} from "scripts/battlegrid/player_turn_handler/HitStatus";
import {GameEvents} from "scripts/events/GameEvents";

type HighlightedPosition = { position: PositionFootprintOne, highlight: SquareHighlight }

export type AvailableInteractions =
    AvailableInteractionsSelectPosition
    | AvailableInteractionsSelectOption
    | AvailableInteractionsSelectHitStatus

export type AvailableInteractionsSelectHitStatus = {
    type: "hit_status_select"
    hit_statuses: Map<Creature, HitStatus>
}

export type AvailableInteractionsSelectPosition = {
    type: "position_select"
    clickable: Array<Position>
    highlighted: Array<HighlightedPosition>
    target: { type: "creatures", value: Array<Creature> } | { type: "positions", value: Array<Position> } | null
    target_label: string
    on_hover: (position: Position) => void
    footprint: number
}

type AvailableInteractionsSelectOption = {
    type: "option_select"
    available_options: Array<OptionButton>
}

export const create_player_turn_handler = ({
                                               battle_grid,
                                               initiative_order,
                                               option_buttons,
                                               hit_status_buttons,
                                               turn_state,
                                               evaluate_ast,
                                               game_events
                                           }: {
    battle_grid: BattleGrid,
    initiative_order: InitiativeOrder,
    option_buttons: OptionButtons
    hit_status_buttons: HitStatusButtons
    turn_state: TurnState
    evaluate_ast: (expr: AstNode) => Expr
    game_events: GameEvents
}): PlayerTurnHandler => {
    let selection_context: AvailableInteractions | null = null

    const set_available_interactions = (available_interactions: AvailableInteractions) => {

    }

    const set_awaiting_position_selection = (interactions: Omit<AvailableInteractionsSelectPosition, "type">) => {
        //TODO AP3 this should be better on_hover
        selection_context = {type: "position_select", ...interactions}

        game_events.player_available_interactions_changed.raise(selection_context)
    }

    const set_awaiting_option_selection = (context: Omit<AvailableInteractionsSelectOption, "type">) => {
        selection_context = {type: "option_select", ...context}

        set_selected_indicator()

        const options = context.available_options.map(option => ({
            ...option,
            on_click: () => {
                option.on_click()
                deselect()
            }
        }))

        option_buttons.display_options(options)
    }

    const set_awaiting_hit_status_selection = ({hit_statuses, on_status_change}: {
        hit_statuses: Map<Creature, HitStatus>
        on_status_change: (creature: Creature, status: HitStatus) => void
    }) => {
        selection_context = {type: "hit_status_select", hit_statuses}

        set_selected_indicator()

        hit_status_buttons.display({
            hit_statuses,
            on_status_change,
            on_confirm: () => deselect(),
        })
    }

    const get_position_selection_context = (): AvailableInteractionsSelectPosition => {
        if (selection_context?.type !== "position_select")
            throw Error("position_select selection_context not set")
        return selection_context
    }

    const get_position_selection_context_or_null = (): AvailableInteractionsSelectPosition | null => {
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
            creature.events.is_untargeted.raise()

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

                    creatures.forEach(creature => creature.events.is_untargeted.raise())
                }
            }
        } else if (selection_context.type === "option_select")
            option_buttons.remove_options()
        else if (selection_context.type === "hit_status_select")
            hit_status_buttons.remove()

        selection_context = null
    }

    const clear_turn_state = () => {
        deselect()
        turn_state.clear()
    }

    function set_action_selection_for_current_character() {
        const instruction = {
            type: INSTRUCTION_TYPE.ADD_POWERS_AS_OPTIONS,
            creature: AST.OWNER,
            cost: "normal",
            filter: "turn"
        } as const
        const owner = initiative_order.get_current_creature()
        turn_state.add_power_frame({name: "Action Selection", instructions: [instruction], owner})
    }

    function get_selection_context() {
        return selection_context
    }

    return {
        set_awaiting_position_selection,
        set_awaiting_option_selection,
        set_awaiting_hit_status_selection,
        get_position_selection_context,
        get_position_selection_context_or_null,
        on_click,
        on_hover,
        set_selected_indicator,
        deselect,
        clear_turn_state,
        set_action_selection_for_current_character,
        get_selection_context
    }
}

export type PlayerTurnHandler = {
    set_awaiting_position_selection: (context: Omit<AvailableInteractionsSelectPosition, "type">) => void
    set_awaiting_option_selection: (context: Omit<AvailableInteractionsSelectOption, "type">) => void
    set_awaiting_hit_status_selection: (context: {
        hit_statuses: Map<Creature, HitStatus>
        on_status_change: (creature: Creature, status: HitStatus) => void
    }) => void
    get_position_selection_context: () => AvailableInteractionsSelectPosition
    get_position_selection_context_or_null: () => AvailableInteractionsSelectPosition | null
    on_click: ({coordinate}: { coordinate: ClickableCoordinate }) => void
    on_hover: ({coordinate}: { coordinate: ClickableCoordinate | null }) => void
    set_selected_indicator: () => void
    deselect: () => void
    clear_turn_state: () => void
    set_action_selection_for_current_character: () => void
    get_selection_context: () => AvailableInteractions | null
}

const show_attack_success_chance_if_needed = ({turn_state, selection_context, evaluate_ast}: {
    turn_state: TurnState,
    selection_context: AvailableInteractionsSelectPosition,
    evaluate_ast: (node: AstNode) => Expr
}) => {
    const next_instruction = turn_state.peek_instruction()
    const needs_roll = next_instruction.type === INSTRUCTION_TYPE.ATTACK_DICE_ROLL
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

            defender.events.is_targeted.raise({attack, defense, chance})
        })
    }
}