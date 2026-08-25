import type {Position} from "core/battlegrid/Position";
import {assert_is_footprint_one, positions_share_surface} from "core/battlegrid/Position";
import type {InterpretInstructionProps} from "core/virtual_machine/instructions/InterpretInstructionProps";
import {get_reach_area_burst} from "core/battlegrid/position/get_reach_area_burst";
import {get_valid_targets} from "core/battlegrid/position/get_valid_targets";
import {get_attack_success_chance} from "core/battlegrid/queries/get_attack_success_chance";
import type {Creature} from "core/battlegrid/creatures/Creature";
import type {
    InstructionSelectTarget,
    InstructionSelectTargetMovement,
    InstructionSelectTargetPush
} from "core/virtual_machine/instructions/instructions";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import {get_shortest_path} from "core/battlegrid/queries/get_shortest_path";
import {assert_is_true} from "stdlib/assert";

export const interpret_select_target = ({
                                            instruction,
                                            game_state,
                                            player_turn_handler,
                                            evaluate_ast
                                        }: InterpretInstructionProps<InstructionSelectTarget>) => {
    const {battle_grid, vm_state} = game_state
    const clickable = get_valid_targets({instruction, battle_grid, evaluate_ast})

    if (clickable.length === 0) return

    const owner = EXPR.as_creature(vm_state.get_variable(SYSTEM_KEYWORD.OWNER))
    const target_label = instruction.target_label

    if (clickable.length === 1) {
        if (vm_state.peek().type !== "attack_dice_roll") {
            const position = clickable[0]

            if (instruction.targeting_type === "area_burst") {
                assert_is_footprint_one(position)
                const distance = instruction.radius
                const highlighted_area = get_reach_area_burst({origin: position, distance, battle_grid})
                const target_positions = highlighted_area.filter(p => battle_grid.is_terrain_occupied(p))
                const targets = battle_grid.get_creatures_in_positions(target_positions)

                vm_state.set_variable(target_label, {type: "creatures", value: targets})
            } else if (instruction.targeting_type === "movement") {
                // TODO P2 automatic resolution for movement feels odd when its a movement action, but not when its a secondary action
                const path = get_shortest_path({creature: owner, destination: position, battle_grid})

                vm_state.set_variable(target_label, {type: "positions", value: path})
            } else if (instruction.targeting_type === "push") {
                vm_state.set_variable(target_label, {type: "positions", value: [position]})
            } else {
                if (instruction.target_type === "terrain") {
                    vm_state.set_variable(target_label, {type: "positions", value: [position]})
                } else if ((instruction.target_type === "creature" || instruction.target_type === "enemy")) {
                    const creature = battle_grid.get_creature_by_position(position)
                    vm_state.set_variable(target_label, {type: "creatures", value: [creature]})
                } else {
                    throw Error(`instruction not valid: targeting_type '${instruction.targeting_type}' target_type '${instruction.target_type}'`)
                }
            }

            return
        }
    }

    const get_attack_hit_chance_against = (creature: Creature) => {
        const next_instruction = vm_state.peek()
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

        const footprint = moving_creature.data.position.footprint

        player_turn_handler.set_available_interactions({
            type: "select_path",
            target_label,
            clickable,
            footprint,
            get_path_to_destination,
        })
    } else if (instruction.targeting_type === "area_burst") {
        const get_area_for_position = (position: Position) => {
            assert_is_footprint_one(position)
            return get_reach_area_burst({origin: position, distance: instruction.radius, battle_grid})
        }

        const get_targets_for_position = (position: Position): Array<Creature> => {
            assert_position_is_clickable({position, clickable})

            const area = get_area_for_position(position)
            const target_positions = area.filter(p => battle_grid.is_terrain_occupied(p))
            return battle_grid.get_creatures_in_positions(target_positions)
        }

        player_turn_handler.set_available_interactions({
            type: "select_area",
            target_label,
            clickable,
            get_area_for_position,
            get_targets_for_position,
            get_attack_hit_chance_against,
        })
    } else if (instruction.target_type === "terrain") {

        player_turn_handler.set_available_interactions({
            type: "select_terrain",
            target_label,
            clickable,
        })
    } else if (instruction.target_type === "creature" || instruction.target_type === "enemy") {
        const get_target_for_position = (position: Position): Creature => {
            assert_position_is_clickable({position, clickable})

            return battle_grid.get_creature_by_position(position)
        }

        player_turn_handler.set_available_interactions({
            type: "select_creature",
            target_label,
            clickable,
            get_target_for_position,
            get_attack_hit_chance_against,
        })
    } else {
        throw Error(`instruction not valid: targeting_type '${instruction.targeting_type}' target_type '${instruction.target_type}'`)
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
