export const create_html_element = (tag: HtmlElementTag, class_name: string) => {
    const element = document.createElement(tag)
    element.className = class_name
    return element
}

type HtmlElementTag = Parameters<typeof document.createElement>[0]