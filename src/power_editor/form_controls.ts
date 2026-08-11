import {create_html_element} from "web_components/utils/create_html_element";

export const create_labeled_input = ({
    label,
    value,
    placeholder,
    on_change,
    type = "text",
    required = false,
}: {
    label: string
    value: string
    placeholder?: string
    on_change: (value: string) => void
    type?: "text" | "number"
    required?: boolean
}) => {
    const field = create_html_element("label", "power-editor__field");
    const label_el = create_html_element("span", "power-editor__label");
    label_el.textContent = label;
    const input = create_html_element("input", "power-editor__input") as HTMLInputElement;
    input.type = type;
    input.value = value;
    input.placeholder = placeholder ?? "";
    input.required = required;
    input.addEventListener("input", () => on_change(input.value));
    field.append(label_el, input);
    return {field, input};
};

export const create_labeled_textarea = ({
    label,
    value,
    placeholder,
    on_change,
}: {
    label: string
    value: string
    placeholder?: string
    on_change: (value: string) => void
}) => {
    const field = create_html_element("label", "power-editor__field");
    const label_el = create_html_element("span", "power-editor__label");
    label_el.textContent = label;
    const textarea = create_html_element("textarea", "power-editor__textarea") as HTMLTextAreaElement;
    textarea.value = value;
    textarea.placeholder = placeholder ?? "";
    textarea.addEventListener("input", () => on_change(textarea.value));
    field.append(label_el, textarea);
    return {field, textarea};
};

export const create_labeled_select = <T extends string>({
    label,
    value,
    options,
    on_change,
}: {
    label: string
    value: T
    options: Array<{value: T, label: string}>
    on_change: (value: T) => void
}) => {
    const field = create_html_element("label", "power-editor__field");
    const label_el = create_html_element("span", "power-editor__label");
    label_el.textContent = label;
    const select = create_html_element("select", "power-editor__select") as HTMLSelectElement;
    for (const option of options) {
        const option_el = document.createElement("option");
        option_el.value = option.value;
        option_el.textContent = option.label;
        select.append(option_el);
    }
    select.value = value;
    select.addEventListener("change", () => on_change(select.value as T));
    field.append(label_el, select);
    return {field, select};
};

export const create_checkbox = ({
    label,
    checked,
    on_change,
}: {
    label: string
    checked: boolean
    on_change: (checked: boolean) => void
}) => {
    const field = create_html_element("label", "power-editor__checkbox-field");
    const input = create_html_element("input", "power-editor__checkbox") as HTMLInputElement;
    input.type = "checkbox";
    input.checked = checked;
    input.addEventListener("change", () => on_change(input.checked));
    const label_el = create_html_element("span", "power-editor__checkbox-label");
    label_el.textContent = label;
    field.append(input, label_el);
    return {field, input};
};

export const create_checkbox_group = <T extends string>({
    label,
    values,
    options,
    on_change,
}: {
    label: string
    values: Array<T>
    options: Array<{value: T, label: string}>
    on_change: (values: Array<T>) => void
}) => {
    const field = create_html_element("fieldset", "power-editor__checkbox-group");
    const legend = create_html_element("legend", "power-editor__label");
    legend.textContent = label;
    field.append(legend);

    for (const option of options) {
        const {field: checkbox_field, input} = create_checkbox({
            label: option.label,
            checked: values.includes(option.value),
            on_change: (checked) => {
                const next_values = checked
                    ? [...values, option.value]
                    : values.filter(value => value !== option.value);
                on_change(next_values);
            },
        });
        field.append(checkbox_field);
    }

    return field;
};

export const create_toggleable_section = ({
    title,
    get_enabled,
    on_toggle,
    mount_content,
}: {
    title: string
    get_enabled: () => boolean
    on_toggle: (enabled: boolean) => void
    mount_content: (content_host: HTMLElement) => void
}) => {
    const section = create_html_element("section", "power-editor__section");
    const header = create_html_element("div", "power-editor__section-header");
    const title_el = create_html_element("h2", "power-editor__section-title");
    title_el.textContent = title;
    header.append(title_el);

    const content_host = create_html_element("div", "power-editor__section-content");

    const refresh_visibility = () => {
        if (get_enabled()) {
            if (!content_host.isConnected) section.append(content_host);
        } else {
            content_host.remove();
        }
    };

    const {field: toggle_field} = create_checkbox({
        label: "Enabled",
        checked: get_enabled(),
        on_change: (enabled) => {
            on_toggle(enabled);
            refresh_visibility();
        },
    });
    toggle_field.classList.add("power-editor__section-toggle");
    header.append(toggle_field);

    section.append(header);
    mount_content(content_host);
    refresh_visibility();

    return section;
};

export const create_section = ({
    title,
    enabled,
    on_toggle,
    content,
}: {
    title: string
    enabled?: boolean
    on_toggle?: (enabled: boolean) => void
    content: HTMLElement
}) => {
    const section = create_html_element("section", "power-editor__section");
    const header = create_html_element("div", "power-editor__section-header");

    const title_el = create_html_element("h2", "power-editor__section-title");
    title_el.textContent = title;
    header.append(title_el);

    if (on_toggle) {
        const {field: toggle_field} = create_checkbox({
            label: "Enabled",
            checked: enabled ?? false,
            on_change: on_toggle,
        });
        toggle_field.classList.add("power-editor__section-toggle");
        header.append(toggle_field);
    }

    section.append(header);

    if (on_toggle === undefined || enabled) {
        section.append(content);
    }

    return section;
};

export const create_button = ({
    label,
    on_click,
    variant = "secondary",
}: {
    label: string
    on_click: () => void
    variant?: "primary" | "secondary" | "danger"
}) => {
    const button = document.createElement("button");
    button.className = `power-editor__button power-editor__button--${variant}`;
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", on_click);
    return button;
};

export const create_string_list_editor = ({
    label,
    get_values,
    placeholder,
    on_change,
}: {
    label: string
    get_values: () => Array<string>
    placeholder?: string
    on_change: (values: Array<string>) => void
}) => {
    const container = create_html_element("div", "power-editor__string-list");
    const title = create_html_element("div", "power-editor__label");
    title.textContent = label;
    container.append(title);

    const list = create_html_element("div", "power-editor__string-list-items");

    const render = () => {
        const values = get_values();
        list.replaceChildren();
        for (const [index, value] of values.entries()) {
            const row = create_html_element("div", "power-editor__string-list-row");
            const input = create_html_element("input", "power-editor__input") as HTMLInputElement;
            input.value = value;
            input.placeholder = placeholder ?? "";
            input.addEventListener("input", () => {
                const next_values = [...get_values()];
                next_values[index] = input.value;
                on_change(next_values);
            });
            const remove_button = create_button({
                label: "Remove",
                variant: "danger",
                on_click: () => {
                    on_change(get_values().filter((_, item_index) => item_index !== index));
                    render();
                },
            });
            row.append(input, remove_button);
            list.append(row);
        }
    };

    const add_button = create_button({
        label: `Add ${label}`,
        on_click: () => {
            on_change([...get_values(), ""]);
            render();
        },
    });

    container.append(list, add_button);
    render();

    return container;
};
