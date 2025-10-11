import {Position, positions_equal, positions_share_surface} from "scripts/battlegrid/Position";
import {InstructionSelectTarget} from "scripts/expressions/tokenizer/transform_power_ir_into_vm_representation";
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
                // TODO automatic resolution for movement feels odd when its a movement action, but not when its a secondary action
                const path = battle_grid.get_shortest_path({creature: context.owner(), destination: position})

                context.set_variable(target_label, {type: "positions", value: path, description: target_label})
            } else if (instruction.targeting_type === "push") {
                context.set_variable(target_label, {type: "position", value: position, description: target_label})
            } else {
                if (instruction.target_type === "terrain") {
                    context.set_variable(target_label, {type: "position", value: position, description: target_label})
                } else if ((instruction.target_type === "creature" || instruction.target_type === "enemy")) {
                    const creature = battle_grid.get_creature_by_position(position)
                    context.set_variable(target_label, {type: "creature", value: creature, description: target_label})
                } else {
                    throw Error(`instruction not valid: targeting_type '${instruction.targeting_type}' target_type '${instruction.target_type}'`)
                }
            }

            return
        }
    }

    const on_click = (position: Position) => {
        if (player_turn_handler.selection_context?.type !== "position_select")
            throw Error("on_click needs selection_context to be set")

        const selection = player_turn_handler.selection_context

        // check if position is selectable
        if (!selection.clickable.some(target => positions_share_surface(target, position)))
            return

        if (selection.target === null) throw Error("target needed for clicking")

        if (selection.target.type === "positions") {
            const path = selection.target.value
            if (!positions_equal(position, path[path.length - 1]))
                throw Error("position should be the end of the path")
        }

        context.set_variable(target_label, selection.target)
    }


    const on_hover = (position: Position) => {
        if (player_turn_handler.selection_context?.type !== "position_select")
            throw Error("on_hover needs selection_context to be set")

        const selection = player_turn_handler.selection_context

        if (!selection.clickable.some(target => positions_share_surface(target, position)))
            return

        if (instruction.targeting_type === "area_burst") {
            const distance = instruction.radius
            const highlighted_area = get_reach_area_burst({origin: position, distance, battle_grid})
            const target_positions = highlighted_area.filter(p => battle_grid.is_terrain_occupied(p))
            const targets = target_positions.map(battle_grid.get_creature_by_position)

            player_turn_handler.set_awaiting_position_selection({
                ...selection_base,
                highlighted_area,
                target: {type: "creatures", value: targets, description: "target"}
            })
        } else if (instruction.targeting_type === "movement") {
            const path = battle_grid.get_shortest_path({creature: context.owner(), destination: position})

            player_turn_handler.set_awaiting_position_selection({
                ...selection_base,
                highlighted_area: path,
                target: {type: "positions", value: path, description: "target"},
            })
        } else if (instruction.targeting_type === "push") {
            //TODO push should be a path also instead of a position
            player_turn_handler.set_awaiting_position_selection({
                ...selection_base,
                target: {type: "position", value: position, description: "target"}
            })
        } else {
            if (instruction.target_type === "terrain") {
                player_turn_handler.set_awaiting_position_selection({
                    ...selection_base,
                    //TODO these descriptions of target seem off
                    target: {type: "position", value: position, description: "target"}
                })
            } else if ((instruction.target_type === "creature" || instruction.target_type === "enemy")) {
                const creature = battle_grid.get_creature_by_position(position)
                player_turn_handler.set_awaiting_position_selection({
                    ...selection_base,
                    target: {type: "creature", value: creature, description: "target"}
                })
            } else {
                throw Error(`instruction not valid: targeting_type '${instruction.targeting_type}' target_type '${instruction.target_type}'`)
            }
        }
    }

    const selection_base: Omit<PlayerTurnHandlerContextSelectPosition, "owner" | "type"> = {
        clickable,
        highlighted_area: [],
        target: null,
        on_click,
        on_hover,
        //TODO clean up
        footprint: instruction.targeting_type === "movement" ? context.owner().data.position.footprint : 1
    }

    player_turn_handler.set_awaiting_position_selection(selection_base)
}