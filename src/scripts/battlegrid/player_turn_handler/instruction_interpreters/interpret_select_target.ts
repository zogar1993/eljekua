import {
    Position,
    positions_share_surface,
    transform_positions_to_f1
} from "scripts/battlegrid/Position";
import {InstructionSelectTarget} from "scripts/expressions/parser/transform_power_ir_into_vm_representation";
import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {PlayerTurnHandlerContextSelectPosition} from "scripts/battlegrid/player_turn_handler/PlayerTurnHandler";
import {get_reach_area_burst} from "scripts/battlegrid/ranges/get_reach_area_burst";

export const interpret_select_target = ({
                                            instruction,
                                            context,
                                            player_turn_handler,
                                            battle_grid
                                        }: InterpretInstructionProps<InstructionSelectTarget>) => {
    const clickable = player_turn_handler.get_valid_targets({instruction, context})

    if (clickable.length === 0) return

    const target_label = instruction.target_label

    if (clickable.length === 1) {
        if (context.peek_instruction().type !== "attack_roll") {
            const position = clickable[0]

            if (instruction.targeting_type === "area_burst") {
                const distance = instruction.radius
                const highlighted_area = get_reach_area_burst({origin: position, distance, battle_grid})
                const target_positions = highlighted_area.filter(p => battle_grid.is_terrain_occupied(p))
                const targets = target_positions.map(battle_grid.get_creature_by_position)

                context.set_variable(target_label, {type: "creatures", value: targets, description: target_label})
            } else if (instruction.targeting_type === "movement") {
                // TODO P2 automatic resolution for movement feels odd when its a movement action, but not when its a secondary action
                const path = battle_grid.get_shortest_path({creature: context.owner(), destination: position})

                context.set_variable(target_label, {type: "positions", value: path, description: target_label})
            } else if (instruction.targeting_type === "push") {
                context.set_variable(target_label, {type: "positions", value: [position], description: target_label})
            } else {
                if (instruction.target_type === "terrain") {
                    context.set_variable(target_label, {
                        type: "positions",
                        value: [position],
                        description: target_label
                    })
                } else if ((instruction.target_type === "creature" || instruction.target_type === "enemy")) {
                    const creature = battle_grid.get_creature_by_position(position)
                    context.set_variable(target_label, {
                        type: "creatures",
                        value: [creature],
                        description: target_label
                    })
                } else {
                    throw Error(`instruction not valid: targeting_type '${instruction.targeting_type}' target_type '${instruction.target_type}'`)
                }
            }

            return
        }
    }


    const on_hover = (position: Position) => {
        const selection = player_turn_handler.get_position_selection_context()

        if (!selection.clickable.some(target => positions_share_surface(target, position)))
            return

        if (instruction.targeting_type === "area_burst") {
            const distance = instruction.radius
            const area = get_reach_area_burst({origin: position, distance, battle_grid})
            const target_positions = area.filter(p => battle_grid.is_terrain_occupied(p))
            const targets = target_positions.map(battle_grid.get_creature_by_position)

            player_turn_handler.set_awaiting_position_selection({
                ...selection_base,
                highlighted: transform_positions_to_f1(area).map(position => ({position, highlight: "area"})),
                target: {type: "creatures", value: targets}
            })
        } else if (instruction.targeting_type === "movement") {
            const path = battle_grid.get_shortest_path({creature: context.owner(), destination: position})

            player_turn_handler.set_awaiting_position_selection({
                ...selection_base,
                highlighted: transform_positions_to_f1(path).map(position => ({position, highlight: "path"})),
                target: {type: "positions", value: path},
            })
        } else if (instruction.targeting_type === "push") {
            //TODO P0 fix push that was changed from position to positions
            player_turn_handler.set_awaiting_position_selection({
                ...selection_base,
                target: {type: "positions", value: [position]}
            })
        } else {
            if (instruction.target_type === "terrain") {
                player_turn_handler.set_awaiting_position_selection({
                    ...selection_base,
                    target: {type: "positions", value: [position]}
                })
            } else if ((instruction.target_type === "creature" || instruction.target_type === "enemy")) {
                const creature = battle_grid.get_creature_by_position(position)
                player_turn_handler.set_awaiting_position_selection({
                    ...selection_base,
                    target: {type: "creatures", value: [creature]}
                })
            } else {
                throw Error(`instruction not valid: targeting_type '${instruction.targeting_type}' target_type '${instruction.target_type}'`)
            }
        }
    }

    const selection_base: Omit<PlayerTurnHandlerContextSelectPosition, "owner" | "type"> = {
        target_label,
        clickable,
        highlighted: [],
        target: null,
        on_hover,
        //TODO P3 clean up
        footprint: instruction.targeting_type === "movement" ? context.owner().data.position.footprint : 1
    }

    player_turn_handler.set_awaiting_position_selection(selection_base)
}