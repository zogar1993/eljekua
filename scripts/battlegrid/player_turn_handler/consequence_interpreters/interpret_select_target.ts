import {Position, positions_equal} from "battlegrid/Position";
import {ConsequenceSelectTarget} from "tokenizer/transform_power_ir_into_vm_representation";
import {
    InterpretConsequenceProps
} from "battlegrid/player_turn_handler/consequence_interpreters/InterpretConsequenceProps";
import {PlayerTurnHandlerContextSelectPosition} from "battlegrid/player_turn_handler/PlayerTurnHandler";

export const interpret_select_target = ({
                                            consequence,
                                            context,
                                            player_turn_handler,
                                            battle_grid
                                        }: InterpretConsequenceProps<ConsequenceSelectTarget>) => {
    const clickable = player_turn_handler.get_valid_targets({consequence, context})

    if (clickable.length === 0) return

    if (clickable.length === 1) {
                //TODO make this apply to all
        if (context.peek_consequence().type !== "attack_roll") {


            context.set_creature({
                name: consequence.target_label,
                value: battle_grid.get_creature_by_position(clickable[0])
            })
            return
        }

    }

    const on_click = (position: Position) => {
        if (player_turn_handler.selection_context?.type !== "position_select")
            throw Error("on_click needs selection_context to be set")

        const selection = player_turn_handler.selection_context

        // check if position is selectable
        if (selection.clickable.every(target => !positions_equal(target, position)))
            return

        if (selection.target === null) throw Error("target needed for clicking")

        if (selection.target.type === "path") {
            const path = selection.target.value
            if (!positions_equal(position, path[path.length - 1]))
                throw Error("position should be the end of the path")
        }

        context.set_variable({name: consequence.target_label, ...selection.target})

    }


    const on_hover = (position: Position) => {
        if (player_turn_handler.selection_context?.type !== "position_select")
            throw Error("on_hover needs selection_context to be set")

        const selection = player_turn_handler.selection_context

        // check if position is clickable
        if (selection.clickable.every(target => !positions_equal(target, position)))
            return

        if (consequence.targeting_type === "area_burst") {
            const distance = consequence.radius
            const highlighted_area = [...battle_grid.get_in_range({origin: position, distance}), position]
            const target_positions = highlighted_area.filter(battle_grid.is_terrain_occupied)
            const targets = target_positions.map(battle_grid.get_creature_by_position)

            player_turn_handler.set_awaiting_position_selection({
                ...selection_base,
                highlighted_area,
                target: {type: "creatures", value: targets}
            })
        } else if (consequence.targeting_type === "movement") {
            const origin = context.owner().data.position
            const path = battle_grid.get_shortest_path({origin, destination: position})

            player_turn_handler.set_awaiting_position_selection({
                ...selection_base,
                highlighted_area: path,
                target: {type: "path", value: path}
            })
        } else {
            if (consequence.target_type === "terrain") {
                player_turn_handler.set_awaiting_position_selection({
                    ...selection_base,
                    target: {type: "position", value: position}
                })
            } else if ((consequence.target_type === "creature" || consequence.target_type === "enemy")) {
                player_turn_handler.set_awaiting_position_selection({
                    ...selection_base,
                    target: {type: "creature", value: battle_grid.get_creature_by_position(position)}
                })
            }
            //TODO else blow up?
        }
    }

    const selection_base: Omit<PlayerTurnHandlerContextSelectPosition, "owner" | "type"> =
        {clickable, highlighted_area: [], target: null, on_click, on_hover}

    player_turn_handler.set_awaiting_position_selection(selection_base)


}