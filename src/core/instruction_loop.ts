import {
    interpret_instruction
} from "core/virtual_machine/instructions/interpret_instruction";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import type {Expr} from "core/virtual_machine/expressions/types";
import type {GameState} from "core/game_state/GameState";
import {OptionButton} from "core/battlegrid/creature_option/CreatureOption";
import {GameEvents} from "core/events/GameEvents";
import {Creature} from "core/battlegrid/creatures/Creature";
import {AttackSuccessChance} from "core/battlegrid/queries/get_attack_success_chance";
import {HitStatus} from "core/battlegrid/player_turn_handler/HitStatus";
import {Position} from "core/battlegrid/Position";
import {assert_is_not_null} from "stdlib/assert";

export type Interaction =
    InteractionsSelectTerrain
    | InteractionsSelectCreature
    | InteractionsSelectOption
    | InteractionsSelectHitStatus
    | InteractionsSelectPath
    | InteractionsSelectArea

export type InteractionsSelectHitStatus = {
    type: "hit_status_select"
    hit_statuses: Map<Creature, HitStatus>
    on_status_change: (creature: Creature, status: HitStatus) => void
    on_confirm: () => void
}

export type InteractionsSelectTerrain = {
    type: "select_terrain"
    target_label: string
    clickable: Array<Position>
    select: (position: Position) => void
}

export type InteractionsSelectCreature = {
    type: "select_creature"
    target_label: string
    clickable: Array<Position>
    get_target_for_position: (position: Position) => Creature
    get_attack_hit_chance_against: (creature: Creature) => AttackSuccessChance | null
    select: (position: Creature) => void
}

export type InteractionsSelectArea = {
    type: "select_area"
    target_label: string
    clickable: Array<Position>
    get_area_for_position: (position: Position) => Array<Position>
    get_targets_for_position: (position: Position) => Array<Creature>
    get_attack_hit_chance_against: (creature: Creature) => AttackSuccessChance | null
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
                                            game_state,
                                            evaluate_ast,
                                            game_events
                                        }: {
    game_state: GameState
    evaluate_ast: (node: AstNode) => Expr
    game_events: GameEvents
}) => {
    const {turn_state} = game_state
    let current_interaction: Interaction | null = null

    const clear_current_interaction = () => {
        current_interaction = null

        game_events.on_available_interactions_changed.raise(null)

        evaluate_instructions()
    }

    const add_cleanup_to_function = <T extends unknown[]>(fn: (...args: T) => void) => {
        return (...args: T) => {
            fn(...args)
            clear_current_interaction()
        }
    }

    // This is needed so that all interactions resume after being resolved
    const add_cleanup_to_interaction_confirmation = (interaction: Interaction): Interaction => {
        switch (interaction.type) {
            case "select_terrain":
                return {...interaction, select: add_cleanup_to_function(interaction.select)}
            case "select_creature":
                return {...interaction, select: add_cleanup_to_function(interaction.select)}
            case "select_area":
                return {...interaction, select: add_cleanup_to_function(interaction.select)}
            case "select_path":
                return {...interaction, select: add_cleanup_to_function(interaction.select)}
            case "option_select":
                return {
                    ...interaction,
                    available_options: interaction.available_options.map(option => ({
                        ...option,
                        on_click: add_cleanup_to_function(option.on_click)
                    }))
                }
            case "hit_status_select":
                return {
                    ...interaction,
                    on_confirm: add_cleanup_to_function(interaction.on_confirm)
                }
        }
    }

    const set_available_interactions = (interaction: Interaction) => {
        current_interaction = add_cleanup_to_interaction_confirmation(interaction)
        game_events.on_available_interactions_changed.raise(current_interaction)
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
                game_state,
                evaluate_ast,
                game_events,
            })
        }
    }

    return {
        ...player_turn_handler,
        run: evaluate_instructions
    }
}

export type InstructionLoop = ReturnType<typeof create_instruction_loop>