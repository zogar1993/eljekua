import {interpret_instruction} from "core/virtual_machine/instructions/interpret_instruction";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import type {Expr} from "core/virtual_machine/expressions/types";
import type {GameState} from "core/game_state/GameState";
import type {OptionButton} from "core/battlegrid/creature_option/CreatureOption";
import type {GameEvents} from "core/events/GameEvents";
import type {Creature} from "core/battlegrid/creatures/Creature";
import type {AttackSuccessChance} from "core/battlegrid/queries/get_attack_success_chance";
import {HIT_STATUS, HitStatus} from "core/virtual_machine/expressions/constants/HitStatus";
import type {Position} from "core/battlegrid/Position";
import {positions_share_surface} from "core/battlegrid/Position";
import {assert_is_not_null, assert_is_not_undefined, assert_is_true} from "stdlib/assert";
import {is_branching_instruction} from "core/virtual_machine/instructions/instructions";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import {EXPR} from "core/virtual_machine/expressions/EXPR";

export const INTERACTION_TYPE = {
    HIT_STATUS_SELECT: "select_hit_status",
    SELECT_TERRAIN: "select_terrain",
    SELECT_CREATURE: "select_creature",
    SELECT_AREA: "select_area",
    SELECT_PATH: "select_path",
    OPTION_SELECT: "select_option",
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
    creature_ids: Array<number>
}

export type InteractionsSelectTerrain = {
    type: typeof INTERACTION_TYPE.SELECT_TERRAIN
    target_label: string
    clickable: Array<Position>
}

export type InteractionsSelectCreature = {
    type: typeof INTERACTION_TYPE.SELECT_CREATURE
    target_label: string
    clickable: Array<Position>
    get_target_for_position: (position: Position) => Creature
    get_attack_hit_chance_against: (creature: Creature) => AttackSuccessChance | null
}

export type InteractionsSelectArea = {
    type: typeof INTERACTION_TYPE.SELECT_AREA
    target_label: string
    clickable: Array<Position>
    get_area_for_position: (position: Position) => Array<Position>
    get_targets_for_position: (position: Position) => Array<Creature>
    get_attack_hit_chance_against: (creature: Creature) => AttackSuccessChance | null
}

export type InteractionsSelectPath = {
    type: typeof INTERACTION_TYPE.SELECT_PATH
    target_label: string
    clickable: Array<Position>
    get_path_to_destination: (position: Position) => Array<Position>
    footprint: number
}

type InteractionsSelectOption = {
    type: typeof INTERACTION_TYPE.OPTION_SELECT
    available_options: Array<OptionButton>
}

export type InteractionSelection =
    InteractionSelectionSelectTerrain
    | InteractionSelectionSelectCreature
    | InteractionSelectionSelectOption
    | InteractionSelectionSelectHitStatus
    | InteractionSelectionSelectPath
    | InteractionSelectionSelectArea

export type InteractionSelectionSelectHitStatus = {
    type: typeof INTERACTION_TYPE.HIT_STATUS_SELECT
    hit_statuses: Array<{ creature_id: number, hit_status: HitStatus }>
}

export type InteractionSelectionSelectTerrain = {
    type: typeof INTERACTION_TYPE.SELECT_TERRAIN
    position: Position
}

export type InteractionSelectionSelectCreature = {
    type: typeof INTERACTION_TYPE.SELECT_CREATURE
    creature_id: number
}

export type InteractionSelectionSelectArea = {
    type: typeof INTERACTION_TYPE.SELECT_AREA
    center: Position
}

export type InteractionSelectionSelectPath = {
    type: typeof INTERACTION_TYPE.SELECT_PATH
    path: Array<Position>
}

export type InteractionSelectionSelectOption = {
    type: typeof INTERACTION_TYPE.OPTION_SELECT
    option: string
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
    const {vm_state, creatures} = game_state
    let current_interaction: Interaction | null = null

    const clear_current_interaction = () => {
        current_interaction = null

        game_events.on_available_interactions_changed.raise(null)

        evaluate_instructions()
    }

    const set_available_interactions = (interaction: Interaction) => {
        current_interaction = interaction
        const creature = vm_state.get_acting_creature()
        game_events.on_available_interactions_changed.raise({...current_interaction, creature})
    }

    const player_turn_handler = {
        set_available_interactions,
    }

    const select = (selection: InteractionSelection) => {
        //TODO add assertions for checking that each selection is valid
        switch (selection.type) {
            case INTERACTION_TYPE.SELECT_TERRAIN: {
                if (current_interaction?.type !== INTERACTION_TYPE.SELECT_TERRAIN) throw Error(`incompatible type ${selection.type}`)

                const position = selection.position

                assert_position_is_contained({position, area: current_interaction.clickable})

                vm_state.set_variable(current_interaction.target_label, {type: "positions", value: [position]})
                break
            }
            case INTERACTION_TYPE.SELECT_CREATURE: {
                if (current_interaction?.type !== INTERACTION_TYPE.SELECT_CREATURE) throw Error(`incompatible type ${selection.type}`)

                // TODO should encapsulate creatures
                const creature = creatures.get_by_id(selection.creature_id)

                vm_state.set_variable(current_interaction.target_label, {type: "creatures", value: [creature]})
                break
            }
            case INTERACTION_TYPE.SELECT_AREA: {
                if (current_interaction?.type !== INTERACTION_TYPE.SELECT_AREA) throw Error(`incompatible type ${selection.type}`)

                const position = selection.center

                assert_position_is_contained({position, area: current_interaction.clickable})

                const targets = current_interaction.get_targets_for_position(position)
                vm_state.set_variable(current_interaction.target_label, {type: "creatures", value: targets})
                break
            }
            case INTERACTION_TYPE.SELECT_PATH: {
                if (current_interaction?.type !== INTERACTION_TYPE.SELECT_PATH) throw Error(`incompatible type ${selection.type}`)

                //TODO validate path is valid
                //assert_position_is_contained({position, area: interaction.clickable})

                vm_state.set_variable(current_interaction.target_label, {type: "positions", value: selection.path})

                break
            }
            case INTERACTION_TYPE.OPTION_SELECT: {
                if (current_interaction?.type !== INTERACTION_TYPE.OPTION_SELECT) throw Error(`incompatible type ${selection.type}`)

                const option = current_interaction.available_options.find(option => option.text === selection.option)
                assert_is_not_undefined(option)
                option.on_click()

                break
            }
            case INTERACTION_TYPE.HIT_STATUS_SELECT: {
                if (current_interaction?.type !== INTERACTION_TYPE.HIT_STATUS_SELECT) throw Error(`incompatible type ${selection.type}`)

                /*
                //TODO better organize how hit statuses are stored into variables
                const previous_hit_statuses = [...EXPR.as_attack_rolls(vm_state.get_variable(SYSTEM_KEYWORD.HIT_STATUS)).entries()]
                for (const [creature] of previous_hit_statuses)
                    assert_is_true(selection.hit_statuses.some(status => creature.id === status.creature_id))

                for (const {creature_id, hit_status} of selection.hit_statuses) {
                    assert_is_true(previous_hit_statuses.some(([creature]) => creature.id === creature_id))
                    assert_is_true(HIT_STATUS.MISS <= hit_status && hit_status <= HIT_STATUS.CRIT)
                }
                */
                
                const new_hit_statuses = new Map<Creature, HitStatus>()
                for (const {creature_id, hit_status} of selection.hit_statuses)
                    new_hit_statuses.set(creatures.get_by_id(creature_id), hit_status)

                vm_state.set_variable(SYSTEM_KEYWORD.HIT_STATUS, {type: "attack_rolls", value: new_hit_statuses})

                break
            }
        }
        clear_current_interaction()
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
        select
    }
}

export type InstructionLoop = ReturnType<typeof create_instruction_loop>


//TODO clean up usages of the player turn handler
export type PlayerTurnHandler = Omit<InstructionLoop, "run" | "select">

const assert_position_is_contained = ({position, area}: {
    position: Position,
    area: Array<Position>
}) => {
    //TODO is this needed to share surface or can we just use equal?
    assert_is_true(area.some(target => positions_share_surface(target, position)))
}