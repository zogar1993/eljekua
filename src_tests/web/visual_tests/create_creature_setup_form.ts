import type {PositionFootprintOne} from "core/battlegrid/Position";
import type {GameState} from "core/game_state/GameState";
import type {IRPower} from "core/types";
import type {ScenarioCreatureSetup} from "scenario_test/ScenarioTest";
import type {BattleGridVisual} from "web/battle_grid/BattleGridVisual";
import {
    get_position_by_coordinate,
    nullable_positions_equal,
} from "web/battle_grid/coordinates/ClickableCoordinate";
import {SQUARE_HIGHLIGHT} from "web/battle_grid/squares/SquareHighlight";
import type {SquareVisual} from "web/battle_grid/squares/SquareVisual";
import {VISUAL_TEST_CREATURE_IMAGE_OPTIONS} from "web/visual_tests/visual_test_creature_images";
import {create_field_group_title, create_labeled_field} from "web/visual_tests/create_labeled_field";
import {create_html_element} from "web/utils/create_html_element";

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
    const html_form = create_html_element("div", "visual-tests__setup-form")
    html_form.append(create_field_group_title("Add creature"))

    const html_name = create_html_element("input", "visual-tests__input") as HTMLInputElement
    html_name.value = "hero"

    const html_team = create_html_element("input", "visual-tests__input") as HTMLInputElement
    html_team.value = "1"

    const html_powers = create_html_element("select", "visual-tests__select") as HTMLSelectElement
    html_powers.multiple = true

    const refresh_power_options = () => {
        const selected_names = new Set(
            Array.from(html_powers.selectedOptions).map(option => option.value),
        )
        html_powers.replaceChildren()
        for (const power of get_available_powers()) {
            const option = document.createElement("option")
            option.value = power.name
            option.textContent = power.name
            option.selected = selected_names.has(power.name)
            html_powers.append(option)
        }
    }

    refresh_power_options()

    let selected_image = VISUAL_TEST_CREATURE_IMAGE_OPTIONS[0].image
    const html_image_picker = create_html_element("div", "visual-tests__image-picker")

    const refresh_image_picker = () => {
        html_image_picker.querySelectorAll(".visual-tests__image-option").forEach(element => {
            element.classList.toggle(
                "visual-tests__image-option--selected",
                element instanceof HTMLElement && element.dataset["image"] === selected_image,
            )
        })
    }

    for (const option of VISUAL_TEST_CREATURE_IMAGE_OPTIONS) {
        const html_option = document.createElement("button")
        html_option.type = "button"
        html_option.className = "visual-tests__image-option"
        html_option.dataset["image"] = option.image
        html_option.title = option.label

        const html_preview = create_html_element("span", "visual-tests__image-option-preview")
        html_preview.style.backgroundImage = option.image

        const html_label = create_html_element("span", "visual-tests__image-option-label")
        html_label.textContent = option.label

        html_option.append(html_preview, html_label)
        html_option.addEventListener("click", () => {
            selected_image = option.image
            refresh_image_picker()
        })
        html_image_picker.append(html_option)
    }

    refresh_image_picker()

    const html_placement_hint = create_html_element("div", "visual-tests__placement-hint")
    html_placement_hint.textContent = "Click a grid square to place the creature."

    const html_add_button = document.createElement("button")
    html_add_button.className = "visual-tests__button"
    html_add_button.type = "button"
    html_add_button.textContent = "Add creature"

    let placement_active = false
    let latest_hovered_position: PositionFootprintOne | null = null

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

    const build_creature_setup = (position: PositionFootprintOne): ScenarioCreatureSetup => {
        const available_powers = get_available_powers()
        const powers_by_name = new Map(available_powers.map(power => [power.name, power]))
        const selected_powers = Array.from(html_powers.selectedOptions)
            .map(option => powers_by_name.get(option.value))
            .filter((power): power is IRPower => power !== undefined)

        return {
            name: html_name.value.trim(),
            team: html_team.value.trim() === "" ? null : Number(html_team.value),
            position,
            image: selected_image,
            powers: selected_powers,
        }
    }

    const cancel_placement = () => {
        if (!placement_active) return
        placement_active = false
        latest_hovered_position = null
        html_add_button.classList.remove("visual-tests__button--active")
        html_add_button.textContent = "Add creature"
        html_placement_hint.hidden = true
        clear_board_highlights()
    }

    const start_placement = () => {
        if (!can_place_creature()) return
        if (get_clickable_positions().length === 0) return

        placement_active = true
        html_add_button.classList.add("visual-tests__button--active")
        html_add_button.textContent = "Cancel placement"
        html_placement_hint.hidden = false
        set_placement_highlights()
    }

    html_add_button.addEventListener("click", () => {
        if (placement_active) {
            cancel_placement()
            return
        }
        start_placement()
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
        if (!placement_active || !can_place_creature()) return

        const position = get_position_by_coordinate({coordinate, positions: get_clickable_positions()}) as PositionFootprintOne | null
        if (position === null) return

        on_add_creature(build_creature_setup(position))
        cancel_placement()
    })

    html_form.append(
        create_labeled_field({label: "Creature name", control: html_name}),
        create_labeled_field({label: "Team (empty = neutral)", control: html_team}),
        create_field_group_title("Sprite"),
        html_image_picker,
        create_labeled_field({label: "Powers", control: html_powers}),
        html_placement_hint,
        html_add_button,
    )

    html_placement_hint.hidden = true

    return {
        html_form,
        cancel_placement,
        refresh_power_options,
    }
}
