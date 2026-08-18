import {
    assert_is_footprint_one,
    Position,
    positions_share_surface,
} from "core/battlegrid/Position";
import {
    InterpretInstructionProps
} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {get_reach_area_burst} from "core/battlegrid/position/get_reach_area_burst";
import {get_valid_targets} from "core/battlegrid/position/get_valid_targets";
import {get_attack_success_chance} from "core/battlegrid/queries/get_attack_success_chance";
import {Creature} from "core/battlegrid/creatures/Creature";
import {
    INSTRUCTION_TYPE,
    InstructionSelectTarget,
    InstructionSelectTargetMovement,
    InstructionSelectTargetPush
} from "core/virtual_machine/instructions/instructions";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import {get_shortest_path} from "core/battlegrid/queries/get_shortest_path";
import {assert_is_true} from "stdlib/assert";
import {Targets} from "core/instruction_loop";

export const interpret_select_target = ({
                                            instruction,
                                            game_state,
                                            player_turn_handler,
                                            evaluate_ast
                                        }: InterpretInstructionProps<InstructionSelectTarget>) => {
    const {battle_grid, turn_state} = game_state
    const clickable = get_valid_targets({instruction, battle_grid, evaluate_ast})

    if (clickable.length === 0) return

    const owner = EXPR.as_creature(turn_state.get_variable(SYSTEM_KEYWORD.OWNER))
    const target_label = instruction.target_label

    if (clickable.length === 1) {
        if (turn_state.peek_instruction().type !== "attack_dice_roll") {
            const position = clickable[0]

            if (instruction.targeting_type === "area_burst") {
                assert_is_footprint_one(position)
                const distance = instruction.radius
                const highlighted_area = get_reach_area_burst({origin: position, distance, battle_grid})
                const target_positions = highlighted_area.filter(p => battle_grid.is_terrain_occupied(p))
                const targets = battle_grid.get_creatures_in_positions(target_positions)

                turn_state.set_variable(target_label, {type: "creatures", value: targets})
            } else if (instruction.targeting_type === "movement") {
                // TODO P2 automatic resolution for movement feels odd when its a movement action, but not when its a secondary action
                const path = get_shortest_path({creature: owner, destination: position, battle_grid})

                turn_state.set_variable(target_label, {type: "positions", value: path, description: target_label})
            } else if (instruction.targeting_type === "push") {
                turn_state.set_variable(target_label, {type: "positions", value: [position], description: target_label})
            } else {
                if (instruction.target_type === "terrain") {
                    turn_state.set_variable(target_label, {
                        type: "positions",
                        value: [position],
                        description: target_label
                    })
                } else if ((instruction.target_type === "creature" || instruction.target_type === "enemy")) {
                    const creature = battle_grid.get_creature_by_position(position)
                    turn_state.set_variable(target_label, {type: "creatures", value: [creature]})
                } else {
                    throw Error(`instruction not valid: targeting_type '${instruction.targeting_type}' target_type '${instruction.target_type}'`)
                }
            }

            return
        }
    }

    const get_attack_hit_chance_against = (creature: Creature) => {
        const next_instruction = turn_state.peek_instruction()
        if (next_instruction.type !== INSTRUCTION_TYPE.ATTACK_DICE_ROLL) return null

        return get_attack_success_chance({
            attack_ast: next_instruction.attack,
            defense_code: next_instruction.defense,
            defender: creature,
            evaluate_ast,
        })
    }

    if (is_path_selection_targeting_type(instruction)) {
        const moving_creature = instruction.targeting_type === "push"
            ? EXPR.as_creature(evaluate_ast(instruction.defender))
            : owner

        const get_path_to_destination = (destination: Position) => {
            return get_shortest_path({creature: moving_creature, destination, battle_grid})
        }

        const select = (path: Array<Position>) => {
            turn_state.set_variable(target_label, {type: "positions", value: path, description: "target"})
        }

        const footprint = moving_creature.data.position.footprint

        player_turn_handler.set_available_interactions({
            type: "select_path",
            target_label,
            clickable,
            footprint,
            get_path_to_destination,
            select,
        })
    } else if (instruction.targeting_type === "area_burst") {
        const get_area_for_position = (position: Position) => {
            assert_is_footprint_one(position)
            return get_reach_area_burst({origin: position, distance: instruction.radius, battle_grid})
        }

        const get_targets_for_position = (position: Position): Targets => {
            assert_position_is_clickable({position, clickable})

            const area = get_area_for_position(position)
            const target_positions = area.filter(p => battle_grid.is_terrain_occupied(p))
            const targets = battle_grid.get_creatures_in_positions(target_positions)

            return {type: "creatures", value: targets}
        }

        const select = (position: Position) => {
            const targets = get_targets_for_position(position)
            if (targets.type !== "creatures") throw Error("area burst must target creatures")

            turn_state.set_variable(target_label, {type: "creatures", value: targets.value})
        }

        player_turn_handler.set_available_interactions({
            type: "select_area",
            target_label,
            clickable,
            get_area_for_position,
            get_targets_for_position,
            get_attack_hit_chance_against,
            select,
        })
    } else {
        const get_targets_for_position = (position: Position): Targets => {
            const interaction = player_turn_handler.get_interaction()

            if (interaction?.type !== "position_select") throw Error("position select selection_context not set")

            assert_position_is_clickable({position, clickable: interaction.clickable})

            if (instruction.target_type === "terrain") {
                return {type: "positions", value: [position]}
            } else if ((instruction.target_type === "creature" || instruction.target_type === "enemy")) {
                const creature = battle_grid.get_creature_by_position(position)
                return {type: "creatures", value: [creature]}
            } else {
                throw Error(`instruction not valid: targeting_type '${instruction.targeting_type}' target_type '${instruction.target_type}'`)
            }
        }

        const select = (position: Position) => {
            const targets = get_targets_for_position(position)
            if (targets === null) return

            turn_state.set_variable(target_label,
                targets.type === "creatures" ? {
                    type: targets.type,
                    value: targets.value,
                } : {
                    type: targets.type,
                    value: targets.value,
                    description: "target"
                })
        }

        player_turn_handler.set_available_interactions({
            type: "position_select",
            target_label,
            clickable,
            get_targets_for_position,
            get_attack_hit_chance_against,
            select,
        })
    }
}

const is_path_selection_targeting_type = (instruction: InstructionSelectTarget): instruction is InstructionSelectTargetMovement | InstructionSelectTargetPush => {
    return instruction.targeting_type === "movement" || instruction.targeting_type === "push"
}

const assert_position_is_clickable = ({position, clickable}: {
    position: Position,
    clickable: Array<Position>
}) => {
    assert_is_true(clickable.some(target => positions_share_surface(target, position)))
}
