import type {IRInstruction} from "core/types";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";
import {
    create_content_button,
    CONTENT_EDITOR_BUTTON_SIZE,
    CONTENT_EDITOR_BUTTON_VARIANT,
} from "web/content_editor/create_content_button";
import {create_default_instruction} from "web/visual_tests/power_editor/power_editor_defaults";
import {create_instruction_editor} from "web/visual_tests/power_editor/create_instruction_editor";
import {create_html_element} from "web/core/utils/create_html_element";

export const create_instruction_list_editor = ({
                                                   instructions,
                                                   title,
                                               }: {
    instructions: Array<IRInstruction>
    title?: string
}) => {
    const html_root = create_html_element("div", "content-editor__instruction-list")
    const html_list = create_html_element("div", "content-editor__instruction-list-items")

    type InstructionListEntry = {
        editor: ReturnType<typeof create_instruction_editor>
    }

    const entries: Array<InstructionListEntry> = []

    const notify_changed = () => {
        html_root.dispatchEvent(new Event("change", {bubbles: true}))
    }

    const move_instruction = (from_index: number, to_index: number) => {
        if (from_index < 0 || from_index >= entries.length || to_index < 0 || to_index >= entries.length)
            return

        const [entry] = entries.splice(from_index, 1)
        entries.splice(to_index, 0, entry)
        refresh_list()
        notify_changed()
    }

    const refresh_list = () => {
        html_list.replaceChildren()
        entries.forEach((entry, index) => {
            const html_row = create_html_element("div", "content-editor__instruction-list-item")

            const html_reorder = create_html_element("div", "content-editor__instruction-list-reorder")

            const html_move_up_button = create_content_button({
                text: "↑",
                variant: CONTENT_EDITOR_BUTTON_VARIANT.GHOST,
                size: CONTENT_EDITOR_BUTTON_SIZE.ICON,
                aria_label: "Move instruction up",
                on_click: () => move_instruction(index, index - 1),
            })
            if (index === 0)
                html_move_up_button.disabled = true

            const html_move_down_button = create_content_button({
                text: "↓",
                variant: CONTENT_EDITOR_BUTTON_VARIANT.GHOST,
                size: CONTENT_EDITOR_BUTTON_SIZE.ICON,
                aria_label: "Move instruction down",
                on_click: () => move_instruction(index, index + 1),
            })
            if (index === entries.length - 1)
                html_move_down_button.disabled = true

            html_reorder.append(html_move_up_button, html_move_down_button)
            html_row.append(html_reorder, entry.editor.html_root)
            html_list.append(html_row)
        })
    }

    const add_instruction = (instruction: IRInstruction) => {
        const entry: InstructionListEntry = {
            editor: create_instruction_editor({
                instruction,
                on_remove: () => {
                    const index = entries.indexOf(entry)
                    if (index >= 0) entries.splice(index, 1)
                    refresh_list()
                    notify_changed()
                },
            }),
        }
        entries.push(entry)
        refresh_list()
    }

    for (const instruction of instructions)
        add_instruction(instruction)

    const html_add_button = create_content_button({
        text: "Add instruction",
        variant: CONTENT_EDITOR_BUTTON_VARIANT.SECONDARY,
        size: CONTENT_EDITOR_BUTTON_SIZE.SMALL,
        on_click: () => {
            add_instruction(create_default_instruction(INSTRUCTION_TYPE.APPLY_DAMAGE))
            notify_changed()
        },
    })

    if (title !== undefined && title.length > 0) {
        const html_title = create_html_element("div", "content-editor__subsection-title")
        html_title.textContent = title
        html_root.append(html_title, html_list, html_add_button)
    } else {
        html_root.append(html_list, html_add_button)
    }

    const get_instructions = (): Array<IRInstruction> => entries.map(entry => entry.editor.get_instruction())

    return {html_root, get_instructions}
}
