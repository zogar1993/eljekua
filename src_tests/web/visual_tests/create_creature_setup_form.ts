import type {PositionFootprintOne} from "core/battlegrid/Position";
import type {GameState} from "core/game_state/GameState";
import type {IRPower} from "core/types";
import type {ScenarioCreatureSetup} from "scenario_test/ScenarioTest";
import type {BattleGridVisual} from "web/core/battle_grid/BattleGridVisual";
import {
    get_position_by_coordinate,
    nullable_positions_equal,
} from "web/core/battle_grid/coordinates/ClickableCoordinate";
import {SQUARE_HIGHLIGHT} from "web/core/battle_grid/squares/SquareHighlight";
import type {SquareVisual} from "web/core/battle_grid/squares/SquareVisual";
import {
    create_content_button,
    CONTENT_EDITOR_BUTTON_SIZE,
    CONTENT_EDITOR_BUTTON_VARIANT,
} from "web/content_editor/create_content_button";
import {create_content_panel_title} from "web/content_editor/create_content_editor_layout";
import type {CreatureSetupDraft} from "web/visual_tests/creature_editor/creature_editor_defaults";
import {create_default_creature_setup_draft} from "web/visual_tests/creature_editor/creature_editor_defaults";
import {open_creature_editor_modal} from "web/visual_tests/creature_editor/create_creature_editor_modal";
import {create_html_element} from "web/core/utils/create_html_element";

export const create_creature_setup_form = ({
                                               click_overlay,
                                               board,
                                               game_state,
                                               can_place_creature,
                                               on_add_creature,
                                               get_available_powers,
                                           }: {
    click_overlay: BattleGridVisual
    board: Array<Array<SquareVisual>>
    game_state: GameState
    can_place_creature: () => boolean
    on_add_creature: (creature: ScenarioCreatureSetup) => void
    get_available_powers: () => Array<IRPower>
}) => {
    const html_form = create_html_element("div", "content-editor content-editor__editor-root")

    const html_placement_hint = create_html_element("div", "visual-tests__placement-hint")
    html_placement_hint.textContent = "Click a grid square to place the creature."

    const html_add_button = create_content_button({
        text: "Add creature",
        variant: CONTENT_EDITOR_BUTTON_VARIANT.PRIMARY,
        size: CONTENT_EDITOR_BUTTON_SIZE.SMALL,
    })

    let placement_active = false
    let latest_hovered_position: PositionFootprintOne | null = null
    let pending_creature_draft: CreatureSetupDraft | null = null
    let open_modal_refresh_power_options: (() => void) | undefined

    const get_clickable_positions = (): Array<PositionFootprintOne> => {
        const {size} = game_state.battle_grid
        const positions: Array<PositionFootprintOne> = []
        for (let x = 0; x < size.x; x++)
            for (let y = 0; y < size.y; y++) {
                const position: PositionFootprintOne = {x, y, footprint: 1}
                if (!game_state.battle_grid.is_terrain_occupied(position))
                    positions.push(position)
            }
        return positions
    }

    const clear_board_highlights = () => {
        for (const row of board)
            for (const square of row) {
                square.set_highlight(null)
                square.set_interaction_status("none")
            }
    }

    const set_placement_highlights = () => {
        for (const position of get_clickable_positions())
            board[position.y][position.x].set_highlight(SQUARE_HIGHLIGHT.CLICKABLE)
    }

    const cancel_placement = () => {
        if (!placement_active) return
        placement_active = false
        pending_creature_draft = null
        latest_hovered_position = null
        html_add_button.classList.remove("content-editor__button--active")
        html_add_button.textContent = "Add creature"
        html_placement_hint.hidden = true
        clear_board_highlights()
    }

    const start_placement = (creature_draft: CreatureSetupDraft) => {
        if (!can_place_creature()) return
        if (get_clickable_positions().length === 0) return

        pending_creature_draft = creature_draft
        placement_active = true
        html_add_button.classList.add("content-editor__button--active")
        html_add_button.textContent = "Cancel placement"
        html_placement_hint.hidden = false
        set_placement_highlights()
    }

    const open_creature_modal = () => {
        if (!can_place_creature()) return

        let creature_draft = create_default_creature_setup_draft()

        const modal = open_creature_editor_modal({
            title: "Create creature",
            creature: creature_draft,
            get_available_powers,
            on_creature_changed: (creature) => {
                creature_draft = creature
            },
            on_close: () => {
                start_placement(creature_draft)
            },
        })

        open_modal_refresh_power_options = modal.refresh_power_options
    }

    html_add_button.addEventListener("click", () => {
        if (placement_active) {
            cancel_placement()
            return
        }
        open_creature_modal()
    })

    click_overlay.addOnMouseMoveHandler(coordinate => {
        if (!placement_active) return

        const position: PositionFootprintOne | null = coordinate === null
            ? null
            : get_position_by_coordinate({coordinate, positions: get_clickable_positions()}) as PositionFootprintOne | null

        if (nullable_positions_equal(latest_hovered_position, position)) return
        latest_hovered_position = position

        for (const row of board)
            for (const square of row)
                square.set_interaction_status("none")

        if (position !== null)
            board[position.y][position.x].set_interaction_status("hover")
    })

    click_overlay.addOnClickHandler(coordinate => {
        if (!placement_active || !can_place_creature() || pending_creature_draft === null) return

        const position = get_position_by_coordinate({coordinate, positions: get_clickable_positions()}) as PositionFootprintOne | null
        if (position === null) return

        on_add_creature({...pending_creature_draft, position})
        cancel_placement()
    })

    html_form.append(
        create_content_panel_title("Creatures"),
        html_placement_hint,
        html_add_button,
    )

    html_placement_hint.hidden = true

    const refresh_power_options = () => {
        open_modal_refresh_power_options?.()
    }

    return {
        html_form,
        cancel_placement,
        refresh_power_options,
    }
}
