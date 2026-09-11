import type {PositionFootprintOne} from "core/battlegrid/Position";
import type {GameState} from "core/game_state/GameState";
import {
    EXPECTATION_TYPE,
    SCENARIO_STEP_TYPE,
    type ScenarioExpectation,
    type ScenarioTest,
} from "scenario_test/ScenarioTest";
import type {BattleGridVisual} from "web/core/battle_grid/BattleGridVisual";
import type {ClickableCoordinate} from "web/core/battle_grid/coordinates/ClickableCoordinate";
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
import {create_field_group_title} from "web/visual_tests/create_labeled_field";
import {create_number_input, read_number_value} from "web/visual_tests/power_editor/create_form_controls";
import {create_labeled_field} from "web/visual_tests/create_labeled_field";
import {create_html_element} from "web/core/utils/create_html_element";

const EXPECTATION_FLOW_STATE = {
    IDLE: "idle",
    CHOOSE_TYPE: "choose_type",
    POSITION_PICK_CREATURE: "position_pick_creature",
    POSITION_PICK_SQUARE: "position_pick_square",
    HP_PICK_CREATURE: "hp_pick_creature",
    HP_ENTER_VALUE: "hp_enter_value",
} as const

type ExpectationFlowState = typeof EXPECTATION_FLOW_STATE[keyof typeof EXPECTATION_FLOW_STATE]

const read_finite_number = (input: HTMLInputElement) => {
    const value = read_number_value(input)
    if (!Number.isFinite(value))
        throw Error("Enter a valid number.")
    return value
}

export const create_expectation_editor = ({
                                                get_scenario,
                                                set_scenario,
                                                get_game_state,
                                                is_battle_started,
                                                on_expectation_added,
                                                click_overlay,
                                                board,
                                                cancel_creature_placement,
                                            }: {
    get_scenario: () => ScenarioTest
    set_scenario: (scenario: ScenarioTest) => void
    get_game_state: () => GameState
    is_battle_started: () => boolean
    on_expectation_added: () => void
    click_overlay: BattleGridVisual
    board: Array<Array<SquareVisual>>
    cancel_creature_placement: () => void
}) => {
    const html_panel = create_html_element("div", "visual-tests__expectations")
    html_panel.append(create_field_group_title("Expectations"))

    const html_error = create_html_element("div", "visual-tests__expectation-error")
    html_error.hidden = true

    const html_hint = create_html_element("div", "visual-tests__expectation-hint")
    html_hint.hidden = true

    const html_wizard = create_html_element("div", "visual-tests__expectation-wizard")
    html_wizard.hidden = true

    const html_type_choices = create_html_element("div", "visual-tests__expectation-type-choices")

    const html_position_type_button = create_content_button({
        text: "Position",
        variant: CONTENT_EDITOR_BUTTON_VARIANT.SECONDARY,
        size: CONTENT_EDITOR_BUTTON_SIZE.SMALL,
    })

    const html_hp_type_button = create_content_button({
        text: "Health",
        variant: CONTENT_EDITOR_BUTTON_VARIANT.SECONDARY,
        size: CONTENT_EDITOR_BUTTON_SIZE.SMALL,
    })

    html_type_choices.append(html_position_type_button, html_hp_type_button)

    const html_hp_value_panel = create_html_element("div", "visual-tests__expectation-hp-value")
    html_hp_value_panel.hidden = true

    const html_hp_input = create_number_input({value: 0, compact: true})
    const html_hp_confirm_button = create_content_button({
        text: "Confirm health",
        variant: CONTENT_EDITOR_BUTTON_VARIANT.PRIMARY,
        size: CONTENT_EDITOR_BUTTON_SIZE.SMALL,
    })

    html_hp_value_panel.append(
        create_labeled_field({label: "Expected HP", control: html_hp_input, compact: true}),
        html_hp_confirm_button,
    )

    const html_cancel_button = create_content_button({
        text: "Cancel",
        variant: CONTENT_EDITOR_BUTTON_VARIANT.SECONDARY,
        size: CONTENT_EDITOR_BUTTON_SIZE.SMALL,
    })

    html_wizard.append(html_hint, html_type_choices, html_hp_value_panel, html_cancel_button)

    const html_add_expectation_button = create_content_button({
        text: "Add expectation",
        variant: CONTENT_EDITOR_BUTTON_VARIANT.PRIMARY,
        size: CONTENT_EDITOR_BUTTON_SIZE.SMALL,
    })

    html_panel.append(html_add_expectation_button, html_wizard, html_error)

    let flow_state: ExpectationFlowState = EXPECTATION_FLOW_STATE.IDLE
    let pending_creature_name: string | null = null
    let latest_hovered_position: PositionFootprintOne | null = null

    const show_error = (message: string) => {
        html_error.textContent = message
        html_error.hidden = false
    }

    const clear_error = () => {
        html_error.hidden = true
        html_error.textContent = ""
    }

    const get_all_grid_positions = (): Array<PositionFootprintOne> => {
        const {size} = get_game_state().battle_grid
        const positions: Array<PositionFootprintOne> = []
        for (let x = 0; x < size.x; x++)
            for (let y = 0; y < size.y; y++)
                positions.push({x, y, footprint: 1})
        return positions
    }

    const get_creature_occupied_positions = (): Array<PositionFootprintOne> => {
        const positions: Array<PositionFootprintOne> = []
        for (const creature of get_game_state().creatures.get_all())
            for (const position of get_game_state().battle_grid.get_squares(creature.data.position))
                positions.push(position.position)
        return positions
    }

    const get_position_at_coordinate = (coordinate: ClickableCoordinate): PositionFootprintOne | null => {
        const position = get_position_by_coordinate({coordinate, positions: get_all_grid_positions()})
        if (position === null) return null
        return {x: position.x, y: position.y, footprint: 1}
    }

    const get_creature_at_coordinate = (coordinate: ClickableCoordinate) => {
        const position = get_position_at_coordinate(coordinate)
        if (position === null) return null
        try {
            return get_game_state().battle_grid.get_creature_by_position(position)
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

    const set_square_highlights = (positions: Array<PositionFootprintOne>) => {
        clear_board_highlights()
        for (const position of positions)
            board[position.y][position.x].set_highlight(SQUARE_HIGHLIGHT.CLICKABLE)
    }

    const append_expectation = (expectation: ScenarioExpectation) => {
        if (!is_battle_started()) return
        const scenario = get_scenario()
        set_scenario({
            ...scenario,
            steps: [...scenario.steps, {type: SCENARIO_STEP_TYPE.EXPECT, expectation}],
        })
        on_expectation_added()
    }

    const set_hint = (message: string) => {
        html_hint.textContent = message
        html_hint.hidden = false
    }

    const refresh_wizard_visibility = () => {
        const is_active = flow_state !== EXPECTATION_FLOW_STATE.IDLE
        html_wizard.hidden = !is_active
        html_add_expectation_button.hidden = is_active
        html_type_choices.hidden = flow_state !== EXPECTATION_FLOW_STATE.CHOOSE_TYPE
        html_hp_value_panel.hidden = flow_state !== EXPECTATION_FLOW_STATE.HP_ENTER_VALUE
        html_cancel_button.hidden = !is_active
    }

    const cancel_expectation_flow = () => {
        flow_state = EXPECTATION_FLOW_STATE.IDLE
        pending_creature_name = null
        latest_hovered_position = null
        clear_error()
        html_hint.hidden = true
        clear_board_highlights()
        click_overlay.reset_mouse_tracking()
        click_overlay.refresh_mouse_handlers()
        refresh_wizard_visibility()
    }

    const start_expectation_flow = () => {
        if (!is_battle_started()) {
            show_error("Start the battle before adding expectations.")
            return
        }

        clear_error()
        cancel_creature_placement()
        flow_state = EXPECTATION_FLOW_STATE.CHOOSE_TYPE
        pending_creature_name = null
        set_hint("Choose an expectation type.")
        refresh_wizard_visibility()
    }

    const start_position_flow = () => {
        flow_state = EXPECTATION_FLOW_STATE.POSITION_PICK_CREATURE
        pending_creature_name = null
        set_hint("Click the creature this expectation applies to.")
        set_square_highlights(get_creature_occupied_positions())
        click_overlay.reset_mouse_tracking()
        click_overlay.refresh_mouse_handlers()
        refresh_wizard_visibility()
    }

    const start_hp_flow = () => {
        flow_state = EXPECTATION_FLOW_STATE.HP_PICK_CREATURE
        pending_creature_name = null
        set_hint("Click the creature on the grid.")
        set_square_highlights(get_creature_occupied_positions())
        click_overlay.reset_mouse_tracking()
        click_overlay.refresh_mouse_handlers()
        refresh_wizard_visibility()
    }

    const complete_position_expectation = (position: PositionFootprintOne) => {
        if (pending_creature_name === null)
            throw Error("Choose a creature first.")

        const creature = get_game_state().creatures.get_all().find(entry => entry.data.name === pending_creature_name)
        if (!creature)
            throw Error(`creature "${pending_creature_name}" not found`)

        append_expectation({
            type: EXPECTATION_TYPE.CREATURE_POSITION,
            creature_name: pending_creature_name,
            position: {x: position.x, y: position.y, footprint: creature.data.position.footprint},
        })
        cancel_expectation_flow()
    }

    const complete_hp_expectation = () => {
        if (pending_creature_name === null)
            throw Error("Choose a creature first.")

        const hp_current = read_finite_number(html_hp_input)
        append_expectation({
            type: EXPECTATION_TYPE.CREATURE_HP,
            creature_name: pending_creature_name,
            hp_current,
        })
        cancel_expectation_flow()
    }

    html_add_expectation_button.addEventListener("click", start_expectation_flow)

    html_position_type_button.addEventListener("click", () => {
        clear_error()
        start_position_flow()
    })

    html_hp_type_button.addEventListener("click", () => {
        clear_error()
        start_hp_flow()
    })

    html_cancel_button.addEventListener("click", cancel_expectation_flow)

    html_hp_confirm_button.addEventListener("click", () => {
        clear_error()
        try {
            complete_hp_expectation()
        } catch (error) {
            show_error(error instanceof Error ? error.message : String(error))
        }
    })

    html_hp_input.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return
        event.preventDefault()
        html_hp_confirm_button.click()
    })

    click_overlay.addOnMouseMoveHandler(coordinate => {
        if (flow_state !== EXPECTATION_FLOW_STATE.POSITION_PICK_SQUARE
            && flow_state !== EXPECTATION_FLOW_STATE.POSITION_PICK_CREATURE
            && flow_state !== EXPECTATION_FLOW_STATE.HP_PICK_CREATURE)
            return

        const clickable_positions = flow_state === EXPECTATION_FLOW_STATE.POSITION_PICK_SQUARE
            ? get_all_grid_positions()
            : get_creature_occupied_positions()

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
        if (!is_battle_started()) return

        clear_error()

        try {
            if (flow_state === EXPECTATION_FLOW_STATE.POSITION_PICK_CREATURE) {
                const creature = get_creature_at_coordinate(coordinate)
                if (creature === null)
                    throw Error("Click a creature on the grid.")

                pending_creature_name = creature.data.name
                flow_state = EXPECTATION_FLOW_STATE.POSITION_PICK_SQUARE
                set_hint(`Click the square where ${pending_creature_name} should be.`)
                set_square_highlights(get_all_grid_positions())
                click_overlay.reset_mouse_tracking()
                click_overlay.refresh_mouse_handlers()
                refresh_wizard_visibility()
                return
            }

            if (flow_state === EXPECTATION_FLOW_STATE.POSITION_PICK_SQUARE) {
                const position = get_position_at_coordinate(coordinate)
                if (position === null)
                    throw Error("Click a square on the battle grid.")

                complete_position_expectation(position)
                return
            }

            if (flow_state === EXPECTATION_FLOW_STATE.HP_PICK_CREATURE) {
                const creature = get_creature_at_coordinate(coordinate)
                if (creature === null)
                    throw Error("Click a creature on the grid.")

                pending_creature_name = creature.data.name
                flow_state = EXPECTATION_FLOW_STATE.HP_ENTER_VALUE
                clear_board_highlights()
                set_hint(`Enter the expected health for ${pending_creature_name}.`)
                html_hp_input.focus()
                html_hp_input.select()
                click_overlay.reset_mouse_tracking()
                click_overlay.refresh_mouse_handlers()
                refresh_wizard_visibility()
            }
        } catch (error) {
            show_error(error instanceof Error ? error.message : String(error))
        }
    })

    const refresh_controls = () => {
        const enabled = is_battle_started()
        html_add_expectation_button.toggleAttribute("disabled", !enabled)
        if (!enabled)
            cancel_expectation_flow()
    }

    return {html_panel, refresh_controls, cancel_expectation_flow}
}
