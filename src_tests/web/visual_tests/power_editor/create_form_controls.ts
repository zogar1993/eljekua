import {create_labeled_field} from "web/visual_tests/create_labeled_field";
import {create_html_element} from "web/utils/create_html_element";

export const create_text_input = ({
                                      value = "",
                                      placeholder = "",
                                  }: {
    value?: string
    placeholder?: string
} = {}) => {
    const html_input = create_html_element("input", "visual-tests__input") as HTMLInputElement
    html_input.type = "text"
    html_input.value = value
    if (placeholder) html_input.placeholder = placeholder
    return html_input
}

export const create_number_input = ({
                                        value = 0,
                                    }: {
    value?: number
} = {}) => {
    const html_input = create_html_element("input", "visual-tests__input") as HTMLInputElement
    html_input.type = "number"
    html_input.value = String(value)
    return html_input
}

export const create_checkbox_input = ({
                                          checked = false,
                                          label,
                                      }: {
    checked?: boolean
    label: string
}) => {
    const html_label = create_html_element("label", "visual-tests__checkbox-field")
    const html_input = create_html_element("input", "visual-tests__checkbox") as HTMLInputElement
    html_input.type = "checkbox"
    html_input.checked = checked
    html_label.append(html_input, document.createTextNode(` ${label}`))
    return {html_label, html_input}
}

export const create_select_input = <T extends string>({
                                                          options,
                                                          value,
                                                      }: {
    options: Array<{ value: T, label: string }>
    value: T
}) => {
    const html_select = create_html_element("select", "visual-tests__select") as HTMLSelectElement
    for (const option of options) {
        const html_option = document.createElement("option")
        html_option.value = option.value
        html_option.textContent = option.label
        html_option.selected = option.value === value
        html_select.append(html_option)
    }
    return html_select
}

export const create_textarea_input = ({
                                          value = "",
                                          rows = 3,
                                      }: {
    value?: string
    rows?: number
} = {}) => {
    const html_textarea = create_html_element("textarea", "visual-tests__textarea") as HTMLTextAreaElement
    html_textarea.rows = rows
    html_textarea.spellcheck = false
    html_textarea.value = value
    return html_textarea
}

export const append_labeled_field = ({
                                         container,
                                         label,
                                         control,
                                     }: {
    container: HTMLElement
    label: string
    control: HTMLElement
}) => {
    container.append(create_labeled_field({label, control}))
}

export const read_text_value = (input: HTMLInputElement | HTMLTextAreaElement) => input.value.trim()

export const read_number_value = (input: HTMLInputElement) => Number(input.value)

export const read_select_value = <T extends string>(select: HTMLSelectElement) => select.value as T
