import type {GameState} from "core/game_state/GameState";
import type {IRPower} from "core/types";
import {validate_creature_setup_draft} from "scenario_test/resolve_creature_setup";
import type {ScenarioCreatureSetup} from "scenario_test/ScenarioTest";
import type {BattleGridVisual} from "web/core/battle_grid/BattleGridVisual";
import type {SquareVisual} from "web/core/battle_grid/squares/SquareVisual";
import {create_creature_setup_form} from "web/visual_tests/create_creature_setup_form";
import {
    create_content_button,
    CONTENT_EDITOR_BUTTON_SIZE,
    CONTENT_EDITOR_BUTTON_VARIANT,
} from "web/content_editor/create_content_button";
import type {CreatureSetupDraft} from "web/visual_tests/creature_editor/creature_editor_defaults";
import {open_creature_editor_modal} from "web/visual_tests/creature_editor/create_creature_editor_modal";
import {create_html_element} from "web/core/utils/create_html_element";

const creature_setup_to_draft = (creature: ScenarioCreatureSetup): CreatureSetupDraft => {
    const {position: _position, ...draft} = creature
    return draft
}

export const create_level_setup_creature_list = ({
                                                     click_overlay,
                                                     board,
                                                     game_state,
                                                     get_creatures,
                                                     can_edit_creatures,
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
    get_available_powers: () => Array<IRPower>
    on_add_creature: (creature: ScenarioCreatureSetup) => void
    on_creature_updated: (creature_index: number, creature: ScenarioCreatureSetup) => void
    on_creature_removed: (creature_index: number) => void
    on_edit_error: (message: string) => void
}) => {
    const html_root = create_html_element("div", "visual-tests__level-setup")
    const html_creature_list = create_html_element("div", "content-editor__card-list")
    let open_modal_refresh_power_options: (() => void) | undefined

    const creature_setup_form = create_creature_setup_form({
        click_overlay,
        board,
        game_state,
        can_place_creature: can_edit_creatures,
        get_available_powers,
        on_add_creature,
        on_placement_error: on_edit_error,
    })

    const report_edit_error = (error: unknown) => {
        on_edit_error(error instanceof Error ? error.message : String(error))
    }

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
        })

        open_modal_refresh_power_options = modal.refresh_power_options
    }

    const refresh = () => {
        html_creature_list.replaceChildren()

        for (const [creature_index, creature] of get_creatures().entries()) {
            const html_item = create_html_element("div", "content-editor__item-card")

            const html_name = create_html_element("span", "content-editor__item-card-name")
            html_name.textContent = `${creature.name} @ (${creature.position.x}, ${creature.position.y})`

            const html_edit_button = create_content_button({
                text: "Edit",
                variant: CONTENT_EDITOR_BUTTON_VARIANT.SECONDARY,
                size: CONTENT_EDITOR_BUTTON_SIZE.SMALL,
                on_click: () => {
                    open_edit_modal(creature_index, creature)
                },
            })
            html_edit_button.disabled = !can_edit_creatures()

            const html_remove_button = create_content_button({
                text: "Remove",
                variant: CONTENT_EDITOR_BUTTON_VARIANT.DANGER,
                size: CONTENT_EDITOR_BUTTON_SIZE.SMALL,
                on_click: () => {
                    on_creature_removed(creature_index)
                },
            })
            html_remove_button.disabled = !can_edit_creatures()

            const html_actions = create_html_element("div", "content-editor__item-card-actions")
            html_actions.append(html_edit_button, html_remove_button)

            html_item.append(html_name, html_actions)
            html_creature_list.append(html_item)
        }
    }

    html_root.append(creature_setup_form.html_form, html_creature_list)
    refresh()

    const refresh_power_options = () => {
        creature_setup_form.refresh_power_options()
        open_modal_refresh_power_options?.()
    }

    return {
        html_root,
        refresh,
        refresh_power_options,
        cancel_creature_placement: creature_setup_form.cancel_placement,
    }
}
