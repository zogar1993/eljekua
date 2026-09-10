export const CONTENT_EDITOR_BUTTON_VARIANT = {
    PRIMARY: "primary",
    SECONDARY: "secondary",
    GHOST: "ghost",
    DANGER: "danger",
} as const

export type ContentEditorButtonVariant = typeof CONTENT_EDITOR_BUTTON_VARIANT[keyof typeof CONTENT_EDITOR_BUTTON_VARIANT]

export const CONTENT_EDITOR_BUTTON_SIZE = {
    SMALL: "small",
    ICON: "icon",
} as const

export type ContentEditorButtonSize = typeof CONTENT_EDITOR_BUTTON_SIZE[keyof typeof CONTENT_EDITOR_BUTTON_SIZE]

export const create_content_button = ({
                                          text,
                                          variant = CONTENT_EDITOR_BUTTON_VARIANT.SECONDARY,
                                          size,
                                          aria_label,
                                          on_click,
                                      }: {
    text: string
    variant?: ContentEditorButtonVariant
    size?: ContentEditorButtonSize
    aria_label?: string
    on_click?: () => void
}) => {
    const html_button = document.createElement("button")
    html_button.type = "button"
    html_button.className = [
        "content-editor__button",
        `content-editor__button--${variant}`,
        size ? `content-editor__button--${size}` : "",
    ].filter(class_name => class_name.length > 0).join(" ")
    html_button.textContent = text
    if (aria_label)
        html_button.setAttribute("aria-label", aria_label)
    if (on_click)
        html_button.addEventListener("click", on_click)
    return html_button
}
