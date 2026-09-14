import type {PositionFootprintOne} from "core/battlegrid/Position";
import type {Creature} from "core/battlegrid/creatures/Creature";
import type {GameState} from "core/game_state/GameState";
import type {IRPower} from "core/types";
import {validate_creature_setup_draft} from "scenario_test/resolve_creature_setup";
import type {ScenarioCreatureSetup} from "scenario_test/ScenarioTest";
import type {BattleGridVisual} from "web/core/battle_grid/BattleGridVisual";
import type {ClickableCoordinate} from "web/core/battle_grid/coordinates/ClickableCoordinate";
import {
    get_position_by_coordinate,
    nullable_positions_equal,
} from "web/core/battle_grid/coordinates/ClickableCoordinate";
import {SQUARE_HIGHLIGHT} from "web/core/battle_grid/squares/SquareHighlight";
import type {SquareVisual} from "web/core/battle_grid/squares/SquareVisual";
import {create_creature_setup_form} from "web/visual_tests/create_creature_setup_form";
import type {CreatureSetupDraft} from "web/visual_tests/creature_editor/creature_editor_defaults";
import {open_creature_editor_modal} from "web/visual_tests/creature_editor/create_creature_editor_modal";
import {create_html_element} from "web/core/utils/create_html_element";

const creature_setup_to_draft = (creature: ScenarioCreatureSetup): CreatureSetupDraft => {
    const {position: _position, ...draft} = creature
    return draft
}

const find_creature_index = ({
                                 creatures,
                                 creature,
                             }: {
    creatures: Array<ScenarioCreatureSetup>
    creature: Creature
}) => creatures.findIndex(entry =>
    entry.name === creature.data.name
    && entry.position.x === creature.data.position.x
    && entry.position.y === creature.data.position.y,
)

export const create_level_setup_creature_list = ({
                                                     click_overlay,
                                                     board,
                                                     game_state,
                                                     get_creatures,
                                                     can_edit_creatures,
                                                     is_grid_creature_click_enabled,
                                                     get_available_powers,
                                                     on_add_creature,
                                                     on_creature_updated,
                                                     on_creature_removed,
                                                     on_edit_error,
                                                 }: {
    click_overlay: BattleGridVisual
    board: Array<Array<SquareVisual>>
    game_state: GameState
    get_creatures: () => Array<ScenarioCreatureSetup>
    can_edit_creatures: () => boolean
    is_grid_creature_click_enabled: () => boolean
    get_available_powers: () => Array<IRPower>
    on_add_creature: (creature: ScenarioCreatureSetup) => void
    on_creature_updated: (creature_index: number, creature: ScenarioCreatureSetup) => void
    on_creature_removed: (creature_index: number) => void
    on_edit_error: (message: string) => void
}) => {
    const html_root = create_html_element("div", "visual-tests__level-setup")
    const html_creature_hint = create_html_element("div", "visual-tests__placement-hint")
    html_creature_hint.textContent = "Click a creature on the grid to edit or remove it."

    let open_modal_refresh_power_options: (() => void) | undefined
    let latest_hovered_position: PositionFootprintOne | null = null

    const report_edit_error = (error: unknown) => {
        on_edit_error(error instanceof Error ? error.message : String(error))
    }

    const get_creature_occupied_positions = (): Array<PositionFootprintOne> => {
        const positions: Array<PositionFootprintOne> = []
        for (const creature of game_state.creatures.get_all())
            for (const position of game_state.battle_grid.get_squares(creature.data.position))
                positions.push(position.position)
        return positions
    }

    const get_creature_at_coordinate = (coordinate: ClickableCoordinate) => {
        const position = get_position_by_coordinate({
            coordinate,
            positions: get_creature_occupied_positions(),
        })
        if (position === null) return null

        try {
            return game_state.battle_grid.get_creature_by_position(position)
        } catch {
            return null
        }
    }

    const clear_board_highlights = () => {
        for (const row of board)
            for (const square of row) {
                square.set_highlight(null)
                square.set_interaction_status("none")
            }
    }

    const set_creature_highlights = () => {
        clear_board_highlights()
        for (const position of get_creature_occupied_positions())
            board[position.y][position.x].set_highlight(SQUARE_HIGHLIGHT.CLICKABLE)
    }

    const refresh_creature_hint = () => {
        const show_hint = can_edit_creatures() && get_creatures().length > 0
        html_creature_hint.hidden = !show_hint
        if (show_hint && is_grid_creature_click_enabled())
            set_creature_highlights()
        else
            clear_board_highlights()
    }

    const creature_setup_form = create_creature_setup_form({
        click_overlay,
        board,
        game_state,
        can_place_creature: can_edit_creatures,
        get_available_powers,
        on_add_creature,
        on_placement_error: on_edit_error,
        on_placement_changed: refresh_creature_hint,
    })

    const open_edit_modal = (creature_index: number, creature: ScenarioCreatureSetup) => {
        if (!can_edit_creatures()) return

        let creature_draft = creature_setup_to_draft(creature)
        const saved_position = creature.position

        const modal = open_creature_editor_modal({
            title: "Edit creature",
            creature: creature_draft,
            get_available_powers,
            on_creature_changed: (next_creature) => {
                creature_draft = next_creature
            },
            primary_action: {
                label: "Save",
                on_confirm: () => {
                    try {
                        validate_creature_setup_draft(creature_draft)
                    } catch (error) {
                        report_edit_error(error)
                        return
                    }

                    on_creature_updated(creature_index, {...creature_draft, position: saved_position})
                },
            },
            delete_action: {
                on_confirm: () => {
                    on_creature_removed(creature_index)
                },
            },
        })

        open_modal_refresh_power_options = modal.refresh_power_options
    }

    click_overlay.addOnMouseMoveHandler(coordinate => {
        if (!is_grid_creature_click_enabled()) return

        const clickable_positions = get_creature_occupied_positions()
        const position = coordinate === null
            ? null
            : get_position_by_coordinate({coordinate, positions: clickable_positions}) as PositionFootprintOne | null

        if (nullable_positions_equal(latest_hovered_position, position)) return
        latest_hovered_position = position

        for (const row of board)
            for (const square of row)
                square.set_interaction_status("none")

        if (position !== null)
            board[position.y][position.x].set_interaction_status("hover")
    })

    click_overlay.addOnClickHandler(coordinate => {
        if (!is_grid_creature_click_enabled()) return

        const creature = get_creature_at_coordinate(coordinate)
        if (creature === null) return

        const creature_index = find_creature_index({creatures: get_creatures(), creature})
        if (creature_index < 0) {
            on_edit_error(`creature "${creature.data.name}" not found in level setup`)
            return
        }

        open_edit_modal(creature_index, get_creatures()[creature_index])
    })

    html_root.append(creature_setup_form.html_form, html_creature_hint)
    html_creature_hint.hidden = true
    refresh_creature_hint()

    const refresh_power_options = () => {
        creature_setup_form.refresh_power_options()
        open_modal_refresh_power_options?.()
    }

    return {
        html_root,
        refresh: refresh_creature_hint,
        refresh_power_options,
        cancel_creature_placement: creature_setup_form.cancel_placement,
        is_placement_active: creature_setup_form.is_placement_active,
    }
}
