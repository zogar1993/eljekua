import {create_html_element} from "web/utils/create_html_element";

export const create_labeled_field = ({
                                         label,
                                         control,
                                     }: {
    label: string
    control: HTMLElement
}) => {
    const html_field = create_html_element("label", "content-editor__field")
    const html_label = create_html_element("span", "content-editor__label")
    html_label.textContent = label
    html_field.append(html_label, control)
    return html_field
}

export const create_field_group_title = (title: string) => {
    const html_title = create_html_element("div", "content-editor__subsection-title")
    html_title.textContent = title
    return html_title
}
