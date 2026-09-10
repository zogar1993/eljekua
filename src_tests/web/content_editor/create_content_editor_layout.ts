import {create_html_element} from "web/core/utils/create_html_element";

export const create_content_section = ({
                                           title,
                                           html_children,
                                       }: {
    title: string
    html_children: Array<HTMLElement>
}) => {
    const html_section = create_html_element("section", "content-editor__section")
    const html_title = create_html_element("h3", "content-editor__section-title")
    html_title.textContent = title
    const html_body = create_html_element("div", "content-editor__section-body")
    html_body.append(...html_children)
    html_section.append(html_title, html_body)
    return html_section
}

export const create_content_panel_title = (title: string) => {
    const html_title = create_html_element("h2", "content-editor__panel-title")
    html_title.textContent = title
    return html_title
}

export const create_content_subsection_title = (title: string) => {
    const html_title = create_html_element("div", "content-editor__subsection-title")
    html_title.textContent = title
    return html_title
}
