import {Position, positions_equal} from "battlegrid/Position";
import {ConsequenceSelectTarget} from "tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretConsequenceProps
} from "battlegrid/player_turn_handler/consequence_interpreters/InterpretConsequenceProps";

export const interpret_select_target = ({
                                            consequence,
                                            context,
                                            player_turn_handler,
                                            battle_grid
                                        }: InterpretConsequenceProps<ConsequenceSelectTarget>) => {
    const available_targets = player_turn_handler.get_valid_targets({consequence, context})

    if (available_targets.length === 0) return

    if (consequence.targeting_type === "area_burst") {
        const on_click = (position: Position) => {
            if (player_turn_handler.selection_context?.type !== "area_burst_select")
                throw Error("selecting a area burst as a target requires selection_context to be set")

            if (player_turn_handler.selection_context.available_targets.every(target => !positions_equal(target, position)))
                return

            const targets = player_turn_handler.selection_context.affected_targets.map(battle_grid.get_creature_by_position)

            context.set_creatures({name: consequence.target_label, value: targets})
        }

        const on_hover = (position: Position) => {
            if (player_turn_handler.selection_context?.type !== "area_burst_select")
                throw Error("area burst on hover requires the area burst selection context to be set")
            if (player_turn_handler.selection_context.available_targets.every(x => !positions_equal(x, position)))
                return

            const distance = consequence.radius
            const affected_area = [...battle_grid.get_in_range({origin: position, distance}), position]
            const affected_targets = affected_area.filter(battle_grid.is_terrain_occupied)

            player_turn_handler.set_awaiting_area_burst_selection({...selection_base, affected_targets, affected_area})
        }

        const selection_base = {available_targets, affected_targets: [], affected_area: [], on_click, on_hover}

        player_turn_handler.set_awaiting_area_burst_selection(selection_base)
    } else if (consequence.targeting_type === "movement") {
        const on_click = (position: Position) => {
            if (player_turn_handler.selection_context?.type !== "path_select")
                throw Error("selecting a path as a target requires selection_context to be set")

            const path = player_turn_handler.selection_context.current_path
            if (!positions_equal(position, path[path.length - 1]))
                throw Error("position should be the end of the path")

            context.set_path({name: consequence.target_label, value: path})
        }

        const on_hover = (position: Position) => {
            if (player_turn_handler.selection_context?.type !== "path_select")
                throw Error("selecting a path as a target requires selection_context to be set")
            if (player_turn_handler.selection_context.available_targets.every(x => !positions_equal(x, position)))
                return

            const origin = player_turn_handler.selection_context.currently_selected.data.position
            const path = battle_grid.get_shortest_path({origin, destination: position})

            player_turn_handler.set_awaiting_path_selection({...selection_base, current_path: path})
        }

        const selection_base = {available_targets, current_path: [], on_click, on_hover}

        player_turn_handler.set_awaiting_path_selection(selection_base)
    } else {
        if (consequence.target_type === "terrain") {
            const on_click = (position: Position) => {
                context.set_variable({name: consequence.target_label, value: position, type: "position"})
            }

            player_turn_handler.set_awaiting_position_selection({available_targets, on_click})
        } else if ((consequence.target_type === "creature" || consequence.target_type === "enemy")) {
            //TODO make this apply to all
            if (available_targets.length === 1 && context.peek_consequence().type !== "attack_roll") {
                context.set_creature({
                    name: consequence.target_label,
                    value: battle_grid.get_creature_by_position(available_targets[0])
                })
                return
            }

            const on_click = (position: Position) => {
                const creature = battle_grid.get_creature_by_position(position)
                context.set_creature({name: consequence.target_label, value: creature})
            }

            player_turn_handler.set_awaiting_position_selection({available_targets, on_click})
        }
    }
}