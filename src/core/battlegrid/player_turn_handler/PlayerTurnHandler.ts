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
    on_status_change: (creature: Creature, status: HitStatus) => void
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
    let current_interaction: Interaction | null = null


    const clear_current_interaction = () => {
        current_interaction = null
        //TODO this should be moved to animation handling so that highlights are cleared
        game_events.on_clear_available_interactions.raise()
        option_buttons.remove_options()
    }

    const add_cleanup_to_function = <T>(fn: (value: T) => void) => {
        return (value: T) => {
            fn(value)
            clear_current_interaction()
        }
    }
    const add_cleanup_to_function_zero = (fn: () => void) => {
        return () => {
            fn()
            clear_current_interaction()
        }
    }

    // This is needed so that all interactions resume after being resolved
    const add_cleanup_to_interaction_confirmation = (interaction: Interaction): Interaction => {
        switch (interaction.type) {
            case "position_select":
                return {...interaction, select: add_cleanup_to_function(interaction.select)}
            case "select_path":
                return {...interaction, select: add_cleanup_to_function(interaction.select)}
            case "option_select":
                return {
                    ...interaction,
                    available_options: interaction.available_options.map(option => ({
                        ...option,
                        on_click: add_cleanup_to_function_zero(option.on_click)
                    }))
                }
            case "hit_status_select":
                return interaction
        }
    }


    const set_available_interactions = (interaction: Interaction) => {
        current_interaction = add_cleanup_to_interaction_confirmation(interaction)
        game_events.on_available_interactions_changed.raise(current_interaction)

        if (current_interaction.type === "option_select") {
            option_buttons.display_options(current_interaction.available_options)
        } else if (current_interaction.type === "hit_status_select") {
            hit_status_buttons.display({
                ...current_interaction,
                on_status_change: current_interaction.on_status_change,
                on_confirm: clear_current_interaction,
            })
        }
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
        return current_interaction
    }

    return {
        set_available_interactions,
        set_action_selection_for_current_character,
        get_interaction,
    }
}

export type PlayerTurnHandler = {
    set_available_interactions: (interactions: Interaction) => void
    set_action_selection_for_current_character: () => void
    get_interaction: () => Interaction | null
}
