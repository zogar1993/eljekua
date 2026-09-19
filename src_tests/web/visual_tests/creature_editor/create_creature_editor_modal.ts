import type {Position} from "core/battlegrid/Position";
import type {IRPower} from "core/types";
import {compact_creature_override} from "scenario_test/scenario_creature_override";
import type {ScenarioCreatureOverride} from "scenario_test/ScenarioTest";
import {
    create_content_button,
    CONTENT_EDITOR_BUTTON_SIZE,
    CONTENT_EDITOR_BUTTON_VARIANT,
} from "web/content_editor/create_content_button";
import type {CreatureSetupDraft} from "web/visual_tests/creature_editor/creature_editor_defaults";
import {create_creature_form} from "web/visual_tests/creature_editor/create_creature_form";
import {create_modal} from "web/visual_tests/create_modal";
import {create_html_element} from "web/core/utils/create_html_element";

const format_creature_json = ({
                                  creature,
                                  position,
                              }: {
    creature: CreatureSetupDraft
    position?: Position
}): string => {
    const override = compact_creature_override({
        ...creature,
        position: position ?? {x: 0, y: 0, footprint: 1},
    })
    const preview: ScenarioCreatureOverride | Omit<ScenarioCreatureOverride, "position"> = position === undefined
        ? (({position: _position, ...rest}) => rest)(override)
        : override
    return JSON.stringify(preview, null, 2)
}

export const open_creature_editor_modal = ({
                                               title,
                                               creature,
                                               preview_position,
                                               get_available_powers,
                                               on_creature_changed,
                                               validate_creature,
                                               on_validation_error,
                                               primary_action,
                                               delete_action,
                                           }: {
    title: string
    creature: CreatureSetupDraft
    preview_position?: Position
    get_available_powers: () => Array<IRPower>
    on_creature_changed: (creature: CreatureSetupDraft) => void
    validate_creature?: (creature: CreatureSetupDraft) => void
    on_validation_error?: (message: string) => void
    primary_action: {
        label: string
        on_confirm: () => void
    }
    delete_action?: {
        label?: string
        on_confirm: () => void
    }
}) => {
    const html_layout = create_html_element("div", "content-editor__split-layout visual-tests__creature-editor-modal")

    const creature_form = create_creature_form({
        creature,
        get_available_powers,
    })

    const html_json_preview = create_html_element("textarea", "content-editor__code-preview") as HTMLTextAreaElement
    html_json_preview.readOnly = true
    html_json_preview.rows = 16
    html_json_preview.spellcheck = false

    const notify_creature_changed = () => {
        const next_creature = creature_form.get_creature_draft()
        refresh_json_preview()
        on_creature_changed(next_creature)
    }

    const refresh_json_preview = () => {
        html_json_preview.value = format_creature_json({
            creature: creature_form.get_creature_draft(),
            position: preview_position,
        })
    }

    creature_form.html_root.addEventListener("input", notify_creature_changed)
    creature_form.html_root.addEventListener("change", notify_creature_changed)
    creature_form.html_root.addEventListener("click", (event) => {
        if (event.target instanceof HTMLElement && event.target.closest(".visual-tests__image-option"))
            notify_creature_changed()
    })
    refresh_json_preview()

    const html_json_section = create_html_element("div", "content-editor__code-panel")
    const html_json_label = create_html_element("h3", "content-editor__code-panel-label")
    html_json_label.textContent = "JSON preview"
    html_json_section.append(html_json_label, html_json_preview)

    html_layout.append(creature_form.html_root, html_json_section)

    const html_footer = create_html_element("div", "visual-tests__modal-footer")

    const html_cancel_button = create_content_button({
        text: "Cancel",
        variant: CONTENT_EDITOR_BUTTON_VARIANT.SECONDARY,
        size: CONTENT_EDITOR_BUTTON_SIZE.SMALL,
    })

    const html_primary_button = create_content_button({
        text: primary_action.label,
        variant: CONTENT_EDITOR_BUTTON_VARIANT.PRIMARY,
        size: CONTENT_EDITOR_BUTTON_SIZE.SMALL,
    })

    const html_delete_button = delete_action === undefined
        ? null
        : create_content_button({
            text: delete_action.label ?? "Delete",
            variant: CONTENT_EDITOR_BUTTON_VARIANT.DANGER,
            size: CONTENT_EDITOR_BUTTON_SIZE.SMALL,
        })

    if (html_delete_button !== null) {
        html_delete_button.classList.add("visual-tests__modal-footer-delete")
        html_footer.append(html_delete_button)
        html_footer.classList.add("visual-tests__modal-footer--with-delete")
    }

    html_footer.append(html_cancel_button, html_primary_button)

    const {close} = create_modal({
        title,
        html_body: html_layout,
        html_footer,
    })

    html_cancel_button.addEventListener("click", close)

    if (html_delete_button !== null && delete_action !== undefined)
        html_delete_button.addEventListener("click", () => {
            close()
            delete_action.on_confirm()
        })

    html_primary_button.addEventListener("click", () => {
        notify_creature_changed()
        const creature_draft = creature_form.get_creature_draft()
        try {
            validate_creature?.(creature_draft)
        } catch (error) {
            on_validation_error?.(error instanceof Error ? error.message : String(error))
            return
        }
        close()
        primary_action.on_confirm()
    })

    return {refresh_power_options: creature_form.refresh_power_options}
}
