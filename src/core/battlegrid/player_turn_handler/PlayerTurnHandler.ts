import {
    Position,
    PositionFootprintOne,
} from "core/battlegrid/Position";
import {Creature} from "core/battlegrid/creatures/Creature";
import {TurnState} from "core/battlegrid/player_turn_handler/TurnState";
import {InitiativeOrder} from "core/initiative_order/InitiativeOrder";
import {SquareHighlight} from "web/battle_grid/squares/SquareHighlight";
import {OptionButton, OptionButtons} from "core/battlegrid/option_buttons/OptionButtons";
import {AST} from "core/expressions/parser/AST_NODE";
import {INSTRUCTION_TYPE} from "core/expressions/parser/instructions";
import {HitStatusButtons} from "core/battlegrid/hit_status_buttons/HitStatusButtons";
import {HitStatus} from "core/battlegrid/player_turn_handler/HitStatus";
import {GameEvents} from "core/events/GameEvents";

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
                                               initiative_order,
                                               option_buttons,
                                               hit_status_buttons,
                                               turn_state,
                                               game_events
                                           }: {
    initiative_order: InitiativeOrder,
    option_buttons: OptionButtons
    hit_status_buttons: HitStatusButtons
    turn_state: TurnState
    game_events: GameEvents
}): PlayerTurnHandler => {
    let selection_context: AvailableInteractions | null = null

    const set_available_interactions = (available_interactions: AvailableInteractions) => {
        selection_context = available_interactions
        game_events.on_available_interactions_changed.raise(selection_context)
    }

    const set_awaiting_option_selection = (context: Omit<AvailableInteractionsSelectOption, "type">) => {
        selection_context = {type: "option_select", ...context}

        game_events.on_acting_creature_changed.raise(turn_state.get_acting_creature())

        const options = context.available_options.map(option => ({
            ...option,
            on_click: () => {
                option.on_click()
                game_events.on_acting_creature_changed.raise(null)
            }
        }))

        option_buttons.display_options(options)
    }

    const set_awaiting_hit_status_selection = ({hit_statuses, on_status_change}: {
        hit_statuses: Map<Creature, HitStatus>
        on_status_change: (creature: Creature, status: HitStatus) => void
    }) => {
        selection_context = {type: "hit_status_select", hit_statuses}

        game_events.on_acting_creature_changed.raise(turn_state.get_acting_creature())

        hit_status_buttons.display({
            hit_statuses,
            on_status_change,
            on_confirm: () => game_events.on_acting_creature_changed.raise(null),
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

    const clear_turn_state = () => {
        turn_state.clear()
        game_events.on_acting_creature_changed.raise(null)
    }

    function set_action_selection_for_current_character() {
        const instruction = {
            type: INSTRUCTION_TYPE.ADD_POWERS_AS_OPTIONS,
            creature: AST.OWNER,
            cost: "normal",
            filter: "turn"
        } as const
        const owner = initiative_order.get_current_creature()
        turn_state.add_instruction_frame({name: "Action Selection", instructions: [instruction], owner})
    }

    function get_selection_context() {
        return selection_context
    }

    function set_selection_context(context: AvailableInteractions | null) {
        selection_context = context
    }

    return {
        set_available_interactions,
        set_awaiting_option_selection,
        set_awaiting_hit_status_selection,
        get_position_selection_context,
        get_position_selection_context_or_null,
        clear_turn_state,
        set_action_selection_for_current_character,
        get_selection_context,
        //TODO remove this since it defeats the purpose
        set_selection_context
    }
}

export type PlayerTurnHandler = {
    set_available_interactions: (interactions: AvailableInteractions) => void
    set_awaiting_option_selection: (context: Omit<AvailableInteractionsSelectOption, "type">) => void
    set_awaiting_hit_status_selection: (context: {
        hit_statuses: Map<Creature, HitStatus>
        on_status_change: (creature: Creature, status: HitStatus) => void
    }) => void
    get_position_selection_context: () => AvailableInteractionsSelectPosition
    get_position_selection_context_or_null: () => AvailableInteractionsSelectPosition | null
    clear_turn_state: () => void
    set_action_selection_for_current_character: () => void
    get_selection_context: () => AvailableInteractions | null
    set_selection_context: (context: AvailableInteractions | null) => void
}