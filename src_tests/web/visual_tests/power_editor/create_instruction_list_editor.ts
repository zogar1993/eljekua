import type {IRInstruction} from "core/types";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";
import {
    create_content_button,
    CONTENT_EDITOR_BUTTON_SIZE,
    CONTENT_EDITOR_BUTTON_VARIANT,
} from "web/content_editor/create_content_button";
import {create_default_instruction} from "web/visual_tests/power_editor/power_editor_defaults";
import {create_instruction_editor} from "web/visual_tests/power_editor/create_instruction_editor";
import {create_html_element} from "web/utils/create_html_element";

export const create_instruction_list_editor = ({
                                                   instructions,
                                                   title,
                                               }: {
    instructions: Array<IRInstruction>
    title: string
}) => {
    const html_root = create_html_element("div", "content-editor__instruction-list")
    const html_title = create_html_element("div", "content-editor__subsection-title")
    html_title.textContent = title
    const html_list = create_html_element("div", "content-editor__instruction-list-items")

    const editors: Array<ReturnType<typeof create_instruction_editor>> = []

    const refresh_list = () => {
        html_list.replaceChildren()
        for (const editor of editors)
            html_list.append(editor.html_root)
    }

    const add_instruction = (instruction: IRInstruction) => {
        const editor = create_instruction_editor({
            instruction,
            on_remove: () => {
                const index = editors.indexOf(editor)
                if (index >= 0) editors.splice(index, 1)
                refresh_list()
            },
        })
        editors.push(editor)
        refresh_list()
    }

    for (const instruction of instructions)
        add_instruction(instruction)

    const html_add_button = create_content_button({
        text: "Add instruction",
        variant: CONTENT_EDITOR_BUTTON_VARIANT.SECONDARY,
        size: CONTENT_EDITOR_BUTTON_SIZE.SMALL,
        on_click: () => add_instruction(create_default_instruction(INSTRUCTION_TYPE.APPLY_DAMAGE)),
    })

    html_root.append(html_title, html_list, html_add_button)

    const get_instructions = (): Array<IRInstruction> => editors.map(editor => editor.get_instruction())

    return {html_root, get_instructions}
}
