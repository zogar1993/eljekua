import {
    interpret_instruction
} from "core/battlegrid/player_turn_handler/instruction_interpreters/interpret_instruction";
import {TurnState} from "core/battlegrid/player_turn_handler/TurnState";
import {BattleGrid} from "core/battlegrid/BattleGrid";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import type {Expr} from "core/expressions/evaluator/types";
import {InitiativeOrder} from "core/initiative_order/InitiativeOrder";
import {Settings} from "core/settings/Settings";
import {OptionButton, OptionButtons} from "core/battlegrid/option_buttons/OptionButtons";
import {HitStatusButtons} from "core/battlegrid/hit_status_buttons/HitStatusButtons";
import {GameEvents} from "core/events/GameEvents";
import {INSTRUCTION_TYPE} from "core/expressions/parser/instructions";
import {Creature} from "core/battlegrid/creatures/Creature";
import {HitStatus} from "core/battlegrid/player_turn_handler/HitStatus";
import {Position} from "core/battlegrid/Position";
import {assert_is_not_null} from "stdlib/assert";

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

//TODO clean up usages of the player turn handler
export type PlayerTurnHandler = {
    set_available_interactions: (interactions: Interaction) => void
    get_interaction: () => Interaction | null
}

export const create_instruction_loop = ({
                                            turn_state,
                                            battle_grid,
                                            evaluate_ast,
                                            initiative_order,
                                            settings,
                                            option_buttons,
                                            hit_status_buttons,
                                            game_events
                                        }: {
    turn_state: TurnState
    battle_grid: BattleGrid
    evaluate_ast: (node: AstNode) => Expr
    initiative_order: InitiativeOrder
    settings: Settings
    option_buttons: OptionButtons
    hit_status_buttons: HitStatusButtons
    game_events: GameEvents
}) => {
    let current_interaction: Interaction | null = null

    const clear_current_interaction = () => {
        current_interaction = null

        game_events.on_available_interactions_changed.raise(null)
        //TODO this should be moved to animation handling so that highlights are cleared
        option_buttons.remove_options()

        evaluate_instructions()
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

    function get_interaction() {
        return current_interaction
    }

    const player_turn_handler = {
        set_available_interactions,
        get_interaction,
    }

    const evaluate_instructions = () => {
        while (player_turn_handler.get_interaction() === null) {
            const instruction = turn_state.next_instruction()
            assert_is_not_null(instruction)

            interpret_instruction({
                instruction,
                player_turn_handler,
                battle_grid,
                turn_state,
                evaluate_ast,
                initiative_order,
                settings
            })
        }
    }

    return {
        ...player_turn_handler,
        run: evaluate_instructions
    }
}

export type InstructionLoop = ReturnType<typeof create_instruction_loop>

//TODO this seems a bit out of place
export const setup_turn_base_frame = (turn_state: TurnState, owner: Creature) => {
    turn_state.add_instruction_frame({
        instructions: [{type: INSTRUCTION_TYPE.ADD_CURRENT_TURN_BASE_OPTIONS}],
        owner,
    })
}