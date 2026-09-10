import type {IRPower} from "core/types";
import {
    create_content_button,
    CONTENT_EDITOR_BUTTON_SIZE,
    CONTENT_EDITOR_BUTTON_VARIANT,
} from "web/content_editor/create_content_button";
import type {CreatureSetupDraft} from "web/visual_tests/creature_editor/creature_editor_defaults";
import {create_creature_form} from "web/visual_tests/creature_editor/create_creature_form";
import {create_modal} from "web/visual_tests/create_modal";
import {create_html_element} from "web/core/utils/create_html_element";

const format_creature_json = (creature: CreatureSetupDraft): string => JSON.stringify(creature, null, 2)

export const open_creature_editor_modal = ({
                                               title,
                                               creature,
                                               get_available_powers,
                                               on_creature_changed,
                                               on_place,
                                           }: {
    title: string
    creature: CreatureSetupDraft
    get_available_powers: () => Array<IRPower>
    on_creature_changed: (creature: CreatureSetupDraft) => void
    on_place: () => void
}) => {
    const html_layout = create_html_element("div", "content-editor__split-layout")

    const creature_form = create_creature_form({
        creature,
        get_available_powers,
    })

    const html_json_preview = create_html_element("textarea", "content-editor__code-preview") as HTMLTextAreaElement
    html_json_preview.readOnly = true
    html_json_preview.rows = 24
    html_json_preview.spellcheck = false

    const notify_creature_changed = () => {
        const next_creature = creature_form.get_creature_draft()
        refresh_json_preview()
        on_creature_changed(next_creature)
    }

    const refresh_json_preview = () => {
        html_json_preview.value = format_creature_json(creature_form.get_creature_draft())
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

    const html_place_button = create_content_button({
        text: "Place on grid",
        variant: CONTENT_EDITOR_BUTTON_VARIANT.PRIMARY,
        size: CONTENT_EDITOR_BUTTON_SIZE.SMALL,
    })

    html_footer.append(html_cancel_button, html_place_button)

    const {close} = create_modal({
        title,
        html_body: html_layout,
        html_footer,
    })

    html_cancel_button.addEventListener("click", close)

    html_place_button.addEventListener("click", () => {
        notify_creature_changed()
        close()
        on_place()
    })

    return {refresh_power_options: creature_form.refresh_power_options}
}
