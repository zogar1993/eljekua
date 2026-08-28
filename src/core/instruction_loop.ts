import {interpret_instruction} from "core/virtual_machine/instructions/interpret_instruction";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import type {Expr} from "core/virtual_machine/expressions/types";
import type {GameState} from "core/game_state/GameState";
import type {OptionButton} from "core/battlegrid/creature_option/CreatureOption";
import type {GameEvents} from "core/events/GameEvents";
import type {Creature} from "core/battlegrid/creatures/Creature";
import type {AttackSuccessChance} from "core/battlegrid/queries/get_attack_success_chance";
import type {HitStatus} from "core/virtual_machine/expressions/constants/HitStatus";
import type {Position} from "core/battlegrid/Position";
import {positions_share_surface} from "core/battlegrid/Position";
import {assert_is_not_null, assert_is_true} from "stdlib/assert";
import {is_branching_instruction} from "core/virtual_machine/instructions/instructions";

export const INTERACTION_TYPE = {
    HIT_STATUS_SELECT: "hit_status_select",
    SELECT_TERRAIN: "select_terrain",
    SELECT_CREATURE: "select_creature",
    SELECT_AREA: "select_area",
    SELECT_PATH: "select_path",
    OPTION_SELECT: "option_select",
} as const

export type InteractionType = typeof INTERACTION_TYPE[keyof typeof INTERACTION_TYPE]

export type Interaction =
    InteractionsSelectTerrain
    | InteractionsSelectCreature
    | InteractionsSelectOption
    | InteractionsSelectHitStatus
    | InteractionsSelectPath
    | InteractionsSelectArea

export type InteractionsSelectHitStatus = {
    type: typeof INTERACTION_TYPE.HIT_STATUS_SELECT
    hit_statuses: Map<Creature, HitStatus>
    on_status_change: (creature: Creature, status: HitStatus) => void
    on_confirm: () => void
}

export type InteractionsSelectTerrain = {
    type: typeof INTERACTION_TYPE.SELECT_TERRAIN
    target_label: string
    clickable: Array<Position>
    select: (position: Position) => void
}

export type InteractionsSelectCreature = {
    type: typeof INTERACTION_TYPE.SELECT_CREATURE
    target_label: string
    clickable: Array<Position>
    get_target_for_position: (position: Position) => Creature
    get_attack_hit_chance_against: (creature: Creature) => AttackSuccessChance | null
    select: (creature: Creature) => void
}

export type InteractionsSelectArea = {
    type: typeof INTERACTION_TYPE.SELECT_AREA
    target_label: string
    clickable: Array<Position>
    get_area_for_position: (position: Position) => Array<Position>
    get_targets_for_position: (position: Position) => Array<Creature>
    get_attack_hit_chance_against: (creature: Creature) => AttackSuccessChance | null
    select: (position: Position) => void
}

export type InteractionsSelectPath = {
    type: typeof INTERACTION_TYPE.SELECT_PATH
    target_label: string
    clickable: Array<Position>
    get_path_to_destination: (position: Position) => Array<Position>
    select: (position: Array<Position>) => void
    footprint: number
}

type InteractionsSelectOption = {
    type: typeof INTERACTION_TYPE.OPTION_SELECT
    available_options: Array<OptionButton>
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
    const {vm_state} = game_state
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
    const add_cleanup_to_interaction_confirmation = (interaction:
                                            Omit<InteractionsSelectTerrain, 'select'>
                                            | Omit<InteractionsSelectCreature, 'select'>
                                            | InteractionsSelectOption
                                            | InteractionsSelectHitStatus
                                            | Omit<InteractionsSelectPath, 'select'>
                                            | Omit<InteractionsSelectArea, 'select'>): Interaction => {


        switch (interaction.type) {
            case INTERACTION_TYPE.SELECT_TERRAIN:
                return {
                    ...interaction,
                    select: (position: Position) => {
                        assert_position_is_contained({position, area: interaction.clickable})

                        vm_state.set_variable(interaction.target_label, {type: "positions", value: [position]})

                        clear_current_interaction()
                    }

                }
            case INTERACTION_TYPE.SELECT_CREATURE:
                return {
                    ...interaction,
                    select: (creature: Creature) => {
                        assert_position_is_contained({position: creature.data.position, area: interaction.clickable})

                        vm_state.set_variable(interaction.target_label, {type: "creatures", value: [creature]})

                        clear_current_interaction()
                    }
                }
            case INTERACTION_TYPE.SELECT_AREA:
                return {
                    ...interaction,
                    select: (position: Position) => {
                        assert_position_is_contained({position, area: interaction.clickable})

                        const targets = interaction.get_targets_for_position(position)
                        vm_state.set_variable(interaction.target_label, {type: "creatures", value: targets})

                        clear_current_interaction()
                    }
                }
            case INTERACTION_TYPE.SELECT_PATH:
                return {
                    ...interaction,
                    select: (path: Array<Position>) => {
                        //TODO validate path is valid
                        //assert_position_is_contained({position, area: interaction.clickable})

                        vm_state.set_variable(interaction.target_label, {type: "positions", value: path})

                        clear_current_interaction()
                    }
                }
            case INTERACTION_TYPE.OPTION_SELECT:
                return {
                    ...interaction,
                    available_options: interaction.available_options.map(option => ({
                        ...option,
                        on_click: add_cleanup_to_function(option.on_click)
                    }))
                }
            case INTERACTION_TYPE.HIT_STATUS_SELECT:
                return {
                    ...interaction,
                    on_confirm: add_cleanup_to_function(interaction.on_confirm)
                }
        }
    }

    const set_available_interactions = (interaction:
                                            Omit<InteractionsSelectTerrain, 'select'>
                                            | Omit<InteractionsSelectCreature, 'select'>
                                            | InteractionsSelectOption
                                            | InteractionsSelectHitStatus
                                            | Omit<InteractionsSelectPath, 'select'>
                                            | Omit<InteractionsSelectArea, 'select'>
    ) => {
        current_interaction = add_cleanup_to_interaction_confirmation(interaction)
        const creature = vm_state.get_acting_creature()
        game_events.on_available_interactions_changed.raise({...current_interaction, creature})
    }

    const player_turn_handler = {
        set_available_interactions,
    }

    const evaluate_instructions = () => {
        while (current_interaction === null) {
            const instruction = vm_state.peek()

            assert_is_not_null(instruction)

            if (!is_branching_instruction(instruction))
                vm_state.jump(1)

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
        set_available_interactions,
        run: evaluate_instructions,
    }
}

export type InstructionLoop = ReturnType<typeof create_instruction_loop>


//TODO clean up usages of the player turn handler
export type PlayerTurnHandler = Omit<InstructionLoop, "run">

const assert_position_is_contained = ({position, area}: {
    position: Position,
    area: Array<Position>
}) => {
    //TODO is this needed to share surface or can we just use equal?
    assert_is_true(area.some(target => positions_share_surface(target, position)))
}