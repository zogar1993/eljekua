import {Position, positions_equal} from "battlegrid/Position";
import {ConsequenceSelectTarget} from "tokenizer/transform_power_ir_into_vm_representation";
import {PowerContext} from "battlegrid/player_turn_handler/PowerContext";
import {PlayerTurnHandler} from "battlegrid/player_turn_handler/PlayerTurnHandler";
import {BattleGrid} from "battlegrid/BattleGrid";

export const interpret_select_target = ({consequence, context, player_turn_handler, battle_grid}: {
    consequence: ConsequenceSelectTarget,
    context: PowerContext,
    player_turn_handler: PlayerTurnHandler,
    battle_grid: BattleGrid
}) => {
                    const valid_targets = player_turn_handler.get_valid_targets({consequence, context})

                    const filtered = valid_targets.filter(
                        target => !consequence.exclude.some(
                            excluded => positions_equal(context.get_creature(excluded).data.position, target)
                        )
                    )

                    if (filtered.length > 0) {
                        if (consequence.target_type === "terrain") {
                            const on_click = (position: Position) => {
                                context.set_variable({
                                    name: consequence.label,
                                    value: position,
                                    type: "position"
                                })
                                player_turn_handler.deselect()
                            }

                            player_turn_handler.set_awaiting_position_selection({
                                currently_selected: context.get_creature("owner"),
                                available_targets: filtered,
                                on_click
                            })
                        } else if ((consequence.target_type === "creature" || consequence.target_type === "enemy")) {
                            const on_click = (position: Position) => {
                                context.set_variable({
                                    name: consequence.label,
                                    value: battle_grid.get_creature_by_position(position),
                                    type: "creature"
                                })
                                player_turn_handler.deselect()
                            }

                            player_turn_handler.set_awaiting_position_selection({
                                currently_selected: context.get_creature("owner"),
                                available_targets: filtered,
                                on_click
                            })
                        } else if (consequence.target_type === "path") {
                            const on_click = (position: Position) => {
                                if (player_turn_handler.selection_context?.type !== "path_select")
                                    throw Error("selecting a path as a target requires selection_context to be set")

                                const path = player_turn_handler.selection_context.current_path
                                if (!positions_equal(position, path[path.length - 1]))
                                    throw Error("position should be the end of the path")

                                context.set_variable({
                                    name: consequence.label,
                                    value: path,
                                    type: "path"
                                })
                                player_turn_handler.deselect()
                            }

                            const on_hover = (position: Position) => {
                                if (player_turn_handler.selection_context?.type !== "path_select")
                                    throw Error("selecting a path as a target requires selection_context to be set")
                                if (player_turn_handler.selection_context.available_targets.every(x => !positions_equal(x, position)))
                                    return

                                const path = battle_grid.get_shortest_path({
                                    origin: player_turn_handler.selection_context.currently_selected.data.position,
                                    destination: position
                                })

                                player_turn_handler.set_awaiting_path_selection({
                                    currently_selected: context.get_creature("owner"),
                                    available_targets: filtered,
                                    current_path: path,
                                    on_click,
                                    on_hover,
                                })
                            }

                            player_turn_handler.set_awaiting_path_selection({
                                currently_selected: context.get_creature("owner"),
                                available_targets: filtered,
                                current_path: [],
                                on_click,
                                on_hover,
                            })
                        } else throw Error(`target type ${consequence.target_type} not valid`)

                    }
                }