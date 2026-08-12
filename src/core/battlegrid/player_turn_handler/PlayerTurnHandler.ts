import {Position} from "core/battlegrid/Position";
import {Creature} from "core/battlegrid/creatures/Creature";
import {TurnState} from "core/battlegrid/player_turn_handler/TurnState";
import {InitiativeOrder} from "core/initiative_order/InitiativeOrder";
import {OptionButton, OptionButtons} from "core/battlegrid/option_buttons/OptionButtons";
import {AST} from "core/expressions/parser/AST_NODE";
import {INSTRUCTION_TYPE} from "core/expressions/parser/instructions";
import {HitStatusButtons} from "core/battlegrid/hit_status_buttons/HitStatusButtons";
import {HitStatus} from "core/battlegrid/player_turn_handler/HitStatus";
import {GameEvents} from "core/events/GameEvents";

export type Interaction =
    InteractionsSelectPosition
    | InteractionsSelectOption
    | InteractionsSelectHitStatus
    | InteractionsSelectPath

export type InteractionsSelectHitStatus = {
    type: "hit_status_select"
    hit_statuses: Map<Creature, HitStatus>
}

export type InteractionsSelectPosition = {
    type: "position_select"
    clickable: Array<Position>
    target_label: string
    get_targets_for_position: (position: Position) => Targets
    footprint: number
    select: (position: Position) => void
}

export type InteractionsSelectPath = {
    type: "select_path"
    target_label: string
    clickable: Array<Position>
    get_path_to_destination: (position: Position) => Array<Position>
    select: (position: Array<Position>) => void
    footprint: number
}

export type Targets = {
    type: "positions",
    value: Array<Position>
} | {
    type: "creatures",
    value: Array<Creature>
}

type InteractionsSelectOption = {
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
    let interaction: Interaction | null = null

    const set_available_interactions = (available_interactions: Interaction) => {
        interaction = available_interactions
        game_events.on_available_interactions_changed.raise(interaction)
    }

    const set_awaiting_option_selection = (_interaction: Omit<InteractionsSelectOption, "type">) => {
        interaction = {type: "option_select", ..._interaction}

        game_events.on_acting_creature_changed.raise(turn_state.get_acting_creature())

        const options = interaction.available_options.map(option => ({
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
        interaction = {type: "hit_status_select", hit_statuses}

        game_events.on_acting_creature_changed.raise(turn_state.get_acting_creature())

        hit_status_buttons.display({
            hit_statuses,
            on_status_change,
            on_confirm: () => game_events.on_acting_creature_changed.raise(null),
        })
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

    function get_interaction() {
        return interaction
    }

    function set_interaction(_interaction: Interaction | null) {
        interaction = _interaction
    }

    return {
        set_available_interactions,
        set_awaiting_option_selection,
        set_awaiting_hit_status_selection,
        clear_turn_state,
        set_action_selection_for_current_character,
        get_interaction,
        //TODO remove this since it defeats the purpose
        set_interaction
    }
}

export type PlayerTurnHandler = {
    set_available_interactions: (interactions: Interaction) => void
    set_awaiting_option_selection: (interaction: Omit<InteractionsSelectOption, "type">) => void
    set_awaiting_hit_status_selection: (interaction: {
        hit_statuses: Map<Creature, HitStatus>
        on_status_change: (creature: Creature, status: HitStatus) => void
    }) => void
    clear_turn_state: () => void
    set_action_selection_for_current_character: () => void
    get_interaction: () => Interaction | null
    set_interaction: (interaction: Interaction | null) => void
}