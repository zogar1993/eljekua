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
    const html_overlay = create_html_element("div", "visual-tests__dialog-overlay")
    const html_dialog = create_html_element("div", "visual-tests__dialog visual-tests__modal")

    const html_header = create_html_element("div", "visual-tests__modal-header")

    const html_title = create_html_element("h2", "visual-tests__modal-title")
    html_title.textContent = title

    const html_close_button = document.createElement("button")
    html_close_button.type = "button"
    html_close_button.className = "visual-tests__button visual-tests__modal-close"
    html_close_button.textContent = "×"
    html_close_button.setAttribute("aria-label", "Close")

    const close = () => {
        html_overlay.remove()
        on_close?.()
    }

    html_close_button.addEventListener("click", close)

    html_header.append(html_title, html_close_button)

    const html_content = create_html_element("div", "visual-tests__modal-body")
    html_content.append(html_body)

    html_dialog.append(html_header, html_content)
    if (html_footer)
        html_dialog.append(html_footer)

    html_overlay.append(html_dialog)
    document.body.append(html_overlay)

    return {close}
}
