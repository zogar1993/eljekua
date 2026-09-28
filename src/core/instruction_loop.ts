import type {GameQueries} from "core/game_state/GameQueries";
import {interpret_instruction} from "core/virtual_machine/instructions/interpret_instruction";
import type {GameState} from "core/game_state/GameState";
import type {GameEvents} from "core/events/GameEvents";
import type {Position} from "core/battlegrid/Position";
import {positions_share_surface} from "core/battlegrid/Position";
import {assert_is_not_null, assert_is_not_undefined, assert_is_true} from "stdlib/assert";
import {is_branching_instruction} from "core/virtual_machine/instructions/instructions";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import type {Creature} from "core/battlegrid/creatures/Creature";
import type {HitStatus} from "core/virtual_machine/expressions/constants/HitStatus";
import {
    Interaction,
    INTERACTION_NONE,
    INTERACTION_TYPE,
    type InteractionSelection,
    InteractionType,
} from "core/interactions/Interactions";

export const create_instruction_loop = ({
                                            game_state,
                                            game_queries,
                                            game_events
                                        }: {
    game_state: GameState
    game_queries: GameQueries
    game_events: GameEvents
}) => {
    const {available_interaction, vm_state, creatures} = game_state

    const clear_current_interaction = () => {
        available_interaction.set_available_interactions(INTERACTION_NONE)

        evaluate_instructions()
    }

    const select = (selection: InteractionSelection) => {
        const current_interaction = available_interaction.get_current()

        switch (selection.type) {
            case INTERACTION_TYPE.SELECT_TERRAIN: {
                assert_interaction_is_of_type(current_interaction, INTERACTION_TYPE.SELECT_TERRAIN)

                const position = selection.position

                assert_position_is_contained({position, area: current_interaction.clickable})

                vm_state.set_variable(current_interaction.target_label, {type: "positions", value: [position]})
                break
            }
            case INTERACTION_TYPE.SELECT_CREATURE: {
                assert_interaction_is_of_type(current_interaction, INTERACTION_TYPE.SELECT_CREATURE)

                // TODO should encapsulate creatures
                const creature = creatures.get_by_id(selection.creature_id)

                vm_state.set_variable(current_interaction.target_label, {type: "creatures", value: [creature]})
                break
            }
            case INTERACTION_TYPE.SELECT_AREA: {
                assert_interaction_is_of_type(current_interaction, INTERACTION_TYPE.SELECT_AREA)

                const position = selection.center

                assert_position_is_contained({position, area: current_interaction.clickable})

                const targets = current_interaction.get_targets_for_position(position)
                vm_state.set_variable(current_interaction.target_label, {type: "creatures", value: targets})
                break
            }
            case INTERACTION_TYPE.SELECT_PATH: {
                assert_interaction_is_of_type(current_interaction, INTERACTION_TYPE.SELECT_PATH)

                //TODO validate path is valid
                //assert_position_is_contained({position, area: interaction.clickable})

                vm_state.set_variable(current_interaction.target_label, {type: "positions", value: selection.path})

                break
            }
            case INTERACTION_TYPE.OPTION_SELECT: {
                assert_interaction_is_of_type(current_interaction, INTERACTION_TYPE.OPTION_SELECT)

                const option = current_interaction.available_options.find(option => option.text === selection.option)
                assert_is_not_undefined(option)
                option.on_click()

                break
            }
            case INTERACTION_TYPE.HIT_STATUS_SELECT: {
                assert_interaction_is_of_type(current_interaction, INTERACTION_TYPE.HIT_STATUS_SELECT)

                //TODO better organize how hit statuses are stored into variables

                const attack_rolls = new Map<Creature, HitStatus>()
                for (const {creature_id, hit_status} of selection.attack_rolls)
                    attack_rolls.set(creatures.get_by_id(creature_id), hit_status)

                vm_state.set_variable(SYSTEM_KEYWORD.HIT_STATUS, {type: "attack_rolls", value: attack_rolls})

                break
            }
            case INTERACTION_TYPE.D20_ROLL_SELECT: {
                assert_interaction_is_of_type(current_interaction, INTERACTION_TYPE.D20_ROLL_SELECT)

                const d20_rolls = new Map<Creature, number>()
                for (const {creature_id, value} of selection.d20_rolls)
                    d20_rolls.set(creatures.get_by_id(creature_id), value)

                vm_state.set_variable(SYSTEM_KEYWORD.ATTACK_D20_ROLLS, {type: "attack_d20_rolls", value: d20_rolls})

                break
            }
        }
        clear_current_interaction()
    }

    const evaluate_instructions = () => {
        while (available_interaction.get_current().type === INTERACTION_TYPE.NONE) {
            const instruction = vm_state.peek()

            assert_is_not_null(instruction)

            if (!is_branching_instruction(instruction))
                vm_state.jump(1)

            interpret_instruction({
                instruction,
                game_state,
                game_queries,
                game_events,
            })
        }
    }

    return {
        run: evaluate_instructions,
        select
    }
}

export type InstructionLoop = ReturnType<typeof create_instruction_loop>

const assert_position_is_contained = ({position, area}: {
    position: Position,
    area: Array<Position>
}) => {
    //TODO is this needed to share surface or can we just use equal?
    assert_is_true(area.some(target => positions_share_surface(target, position)))
}

type InteractionOfType<T extends InteractionType> = Extract<Interaction, { type: T }>

export function assert_interaction_is_of_type<T extends InteractionType>(
    interaction: Interaction,
    type: T,
): asserts interaction is InteractionOfType<T> {
    if (interaction.type !== type) throw Error(`Expected interaction type ${type}, got ${interaction.type}`)
}