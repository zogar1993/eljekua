import {create_content_button, CONTENT_EDITOR_BUTTON_SIZE, CONTENT_EDITOR_BUTTON_VARIANT} from "web/content_editor/create_content_button";
import {create_html_element} from "web/utils/create_html_element";

export const create_modal = ({
                                 title,
                                 html_body,
                                 html_footer,
                                 on_close,
                             }: {
    title: string
    html_body: HTMLElement
    html_footer?: HTMLElement
    on_close?: () => void
}) => {
    const html_overlay = create_html_element("div", "content-editor__overlay content-editor")
    const html_dialog = create_html_element("div", "content-editor__modal")

    const html_header = create_html_element("div", "content-editor__modal-header")

    const html_title = create_html_element("h2", "content-editor__modal-title")
    html_title.textContent = title

    const close = () => {
        html_overlay.remove()
        on_close?.()
    }

    const html_close_button = create_content_button({
        text: "×",
        variant: CONTENT_EDITOR_BUTTON_VARIANT.GHOST,
        size: CONTENT_EDITOR_BUTTON_SIZE.ICON,
        aria_label: "Close",
        on_click: close,
    })

    html_header.append(html_title, html_close_button)

    const html_content = create_html_element("div", "content-editor__modal-body")
    html_content.append(html_body)

    html_dialog.append(html_header, html_content)
    if (html_footer)
        html_dialog.append(html_footer)

    html_overlay.append(html_dialog)
    document.body.append(html_overlay)

    return {close}
}
