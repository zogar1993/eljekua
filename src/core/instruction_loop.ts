import {interpret_instruction} from "core/virtual_machine/instructions/interpret_instruction";
import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import type {Expr} from "core/virtual_machine/expressions/types";
import type {GameState} from "core/game_state/GameState";
import type {GameEvents} from "core/events/GameEvents";
import type {Position} from "core/battlegrid/Position";
import {positions_share_surface} from "core/battlegrid/Position";
import {assert_is_not_null, assert_is_not_undefined, assert_is_true} from "stdlib/assert";
import {is_branching_instruction} from "core/virtual_machine/instructions/instructions";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import type {Creature} from "core/battlegrid/creatures/Creature";
import type {HitStatus} from "core/virtual_machine/expressions/constants/HitStatus";
import {
    INTERACTION_TYPE,
    type Interaction,
    type InteractionSelection,
} from "core/interactions/Interactions";

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

                //TODO better organize how hit statuses are stored into variables
                
                const attack_rolls = new Map<Creature, HitStatus>()
                for (const {creature_id, hit_status} of selection.attack_rolls)
                    attack_rolls.set(creatures.get_by_id(creature_id), hit_status)

                vm_state.set_variable(SYSTEM_KEYWORD.HIT_STATUS, {type: "attack_rolls", value: attack_rolls})

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