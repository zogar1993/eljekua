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

    const refresh_creature_highlights = () => {
        const show_highlights = can_edit_creatures()
            && get_creatures().length > 0
            && is_grid_creature_click_enabled()
        if (show_highlights)
            set_creature_highlights()
        else
            clear_board_highlights()
    }

    const get_existing_creature_names = () => get_creatures().map(creature => creature.name)

    const creature_setup_form = create_creature_setup_form({
        click_overlay,
        board,
        game_state,
        can_place_creature: can_edit_creatures,
        get_available_powers,
        get_existing_creature_names,
        on_add_creature,
        on_placement_error: on_edit_error,
        on_placement_changed: refresh_creature_highlights,
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
            validate_creature: (next_creature) => {
                validate_creature_setup_draft(next_creature, {
                    existing_creature_names: get_creatures()
                        .filter((_, index) => index !== creature_index)
                        .map(entry => entry.name),
                })
            },
            on_validation_error: report_edit_error,
            primary_action: {
                label: "Save",
                on_confirm: () => {
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

    html_root.append(creature_setup_form.html_form)
    refresh_creature_highlights()

    const refresh_power_options = () => {
        creature_setup_form.refresh_power_options()
        open_modal_refresh_power_options?.()
    }

    return {
        html_root,
        refresh: refresh_creature_highlights,
        refresh_power_options,
        cancel_creature_placement: creature_setup_form.cancel_placement,
        is_placement_active: creature_setup_form.is_placement_active,
    }
}
