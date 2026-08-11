import {
    ACTION_TYPES,
    COOLDOWNS,
    DEFENSES,
    INTERCEPTS,
    POWER_KEYWORDS,
    POWER_TRAITS,
    TRIGGER_TYPES,
} from "power_editor/constants";
import {
    create_button,
    create_checkbox,
    create_checkbox_group,
    create_labeled_input,
    create_labeled_select,
    create_labeled_textarea,
    create_section,
    create_string_list_editor,
    create_toggleable_section,
} from "power_editor/form_controls";
import {create_default_power_state, type PowerEditorState} from "power_editor/form_state";
import {create_instruction_list_editor, mount_targeting_fields} from "power_editor/instruction_editor";
import {serialize_power, validate_power} from "power_editor/serialize_power";
import {create_html_element} from "web_components/utils/create_html_element";

export const create_power_editor_app = (root: HTMLElement) => {
    let state = create_default_power_state();

    const layout = create_html_element("div", "power-editor");
    const form_column = create_html_element("div", "power-editor__form-column");
    const output_column = create_html_element("div", "power-editor__output-column");
    layout.append(form_column, output_column);
    root.append(layout);

    const header = create_html_element("header", "power-editor__header");
    header.innerHTML = `
        <h1>Power Editor</h1>
        <p>Configure creature powers and export them as JSON matching <code>IRPower</code>.</p>
    `;
    form_column.append(header);

    const sections_container = create_html_element("div", "power-editor__sections");
    form_column.append(sections_container);

    const validation_panel = create_html_element("div", "power-editor__validation");
    const json_output = create_html_element("pre", "power-editor__json-output");
    const actions = create_html_element("div", "power-editor__output-actions");

    const copy_button = create_button({
        label: "Copy JSON",
        variant: "primary",
        on_click: async () => {
            await navigator.clipboard.writeText(json_output.textContent ?? "");
        },
    });

    const download_button = create_button({
        label: "Download JSON",
        on_click: () => {
            const blob = new Blob([json_output.textContent ?? ""], {type: "application/json"});
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `${state.name.trim() || "power"}.json`;
            anchor.click();
            URL.revokeObjectURL(url);
        },
    });

    const reset_button = create_button({
        label: "Reset",
        variant: "danger",
        on_click: () => {
            state = create_default_power_state();
            mount_form();
            render_output();
        },
    });

    actions.append(copy_button, download_button, reset_button);
    output_column.append(
        create_html_element("h2", "power-editor__output-title"),
        validation_panel,
        json_output,
        actions,
    );
    output_column.querySelector(".power-editor__output-title")!.textContent = "JSON Output";

    const update_state = (updater: (current: PowerEditorState) => PowerEditorState) => {
        state = updater(state);
        render_output();
    };

    const render_output = () => {
        const issues = validate_power(state);
        validation_panel.className = issues.length > 0
            ? "power-editor__validation power-editor__validation--error"
            : "power-editor__validation power-editor__validation--ok";
        validation_panel.textContent = issues.length > 0
            ? issues.map(issue => `${issue.path}: ${issue.message}`).join("\n")
            : "Power configuration is valid.";

        json_output.textContent = JSON.stringify(serialize_power(state), null, 2);
    };

    const mount_form = () => {
        sections_container.replaceChildren(
            mount_basic_info_section(),
            mount_type_section(),
            mount_damage_section(),
            mount_targeting_section(),
            mount_trigger_section(),
            mount_roll_section(),
            mount_effect_section(),
        );
    };

    const mount_basic_info_section = () => {
        const content = create_html_element("div", "power-editor__section-content");
        content.append(
            create_labeled_input({
                label: "Name",
                value: state.name,
                required: true,
                on_change: (name) => update_state(current => ({...current, name})),
            }).field,
            create_labeled_textarea({
                label: "Description",
                value: state.description,
                on_change: (description) => update_state(current => ({...current, description})),
            }).field,
            create_checkbox_group({
                label: "Keywords",
                values: state.keywords,
                options: POWER_KEYWORDS.map(value => ({value, label: value})),
                on_change: (keywords) => update_state(current => ({...current, keywords})),
            }),
            create_string_list_editor({
                label: "Prerequisite",
                get_values: () => state.prerequisites,
                placeholder: `$equipped(owner,"shield")`,
                on_change: (prerequisites) => update_state(current => ({...current, prerequisites})),
            }),
        );
        return create_section({title: "Basic Info", content});
    };

    const mount_type_section = () => {
        const content = create_html_element("div", "power-editor__section-content");
        content.append(
            create_labeled_select({
                label: "Action",
                value: state.type.action,
                options: ACTION_TYPES.map(value => ({value, label: value})),
                on_change: (action) => update_state(current => ({
                    ...current,
                    type: {...current.type, action},
                })),
            }).field,
            create_labeled_select({
                label: "Cooldown",
                value: state.type.cooldown,
                options: COOLDOWNS.map(value => ({value, label: value})),
                on_change: (cooldown) => update_state(current => ({
                    ...current,
                    type: {...current.type, cooldown},
                })),
            }).field,
            create_checkbox_group({
                label: "Traits",
                values: state.type.traits,
                options: POWER_TRAITS.map(value => ({value, label: value})),
                on_change: (traits) => update_state(current => ({
                    ...current,
                    type: {...current.type, traits},
                })),
            }),
            create_checkbox({
                label: "This power is an attack",
                checked: state.type.attack,
                on_change: (attack) => update_state(current => ({
                    ...current,
                    type: {...current.type, attack},
                })),
            }).field,
        );
        return create_section({title: "Type", content});
    };

    const mount_damage_section = () => create_toggleable_section({
        title: "Damage",
        get_enabled: () => state.damage.enabled,
        on_toggle: (enabled) => update_state(current => ({
            ...current,
            damage: {...current.damage, enabled},
        })),
        mount_content: (content) => {
            content.append(
                create_labeled_input({
                    label: "Damage lvl_1",
                    value: state.damage.lvl_1,
                    placeholder: "{1W}",
                    on_change: (lvl_1) => update_state(current => ({
                        ...current,
                        damage: {...current.damage, lvl_1},
                    })),
                }).field,
                create_labeled_input({
                    label: "Damage lvl_11",
                    value: state.damage.lvl_11,
                    on_change: (lvl_11) => update_state(current => ({
                        ...current,
                        damage: {...current.damage, lvl_11},
                    })),
                }).field,
                create_labeled_input({
                    label: "Damage lvl_21",
                    value: state.damage.lvl_21,
                    on_change: (lvl_21) => update_state(current => ({
                        ...current,
                        damage: {...current.damage, lvl_21},
                    })),
                }).field,
            );
        },
    });

    const mount_targeting_section = () => create_toggleable_section({
        title: "Targeting",
        get_enabled: () => state.targeting.enabled,
        on_toggle: (enabled) => update_state(current => ({
            ...current,
            targeting: {...current.targeting, enabled},
        })),
        mount_content: (content) => {
            content.append(mount_targeting_fields({
                get_fields: () => state.targeting,
                on_change: (fields) => update_state(current => ({
                    ...current,
                    targeting: {...current.targeting, ...fields},
                })),
                on_structure_change: () => {},
            }));
        },
    });

    const mount_trigger_section = () => create_toggleable_section({
        title: "Trigger",
        get_enabled: () => state.trigger.enabled,
        on_toggle: (enabled) => update_state(current => ({
            ...current,
            trigger: {...current.trigger, enabled},
        })),
        mount_content: (content) => {
            content.append(
                create_labeled_select({
                    label: "Trigger type",
                    value: state.trigger.type,
                    options: TRIGGER_TYPES.map(value => ({value, label: value})),
                    on_change: (type) => update_state(current => ({
                        ...current,
                        trigger: {...current.trigger, type},
                    })),
                }).field,
                create_checkbox_group({
                    label: "Intercepts",
                    values: state.trigger.intercepts,
                    options: INTERCEPTS.map(value => ({value, label: value})),
                    on_change: (intercepts) => update_state(current => ({
                        ...current,
                        trigger: {...current.trigger, intercepts},
                    })),
                }),
                create_string_list_editor({
                    label: "Condition",
                    get_values: () => state.trigger.conditions,
                    placeholder: `$are_enemies(trigger_activator,trigger_owner)`,
                    on_change: (conditions) => update_state(current => ({
                        ...current,
                        trigger: {...current.trigger, conditions},
                    })),
                }),
            );
        },
    });

    const mount_roll_section = () => create_toggleable_section({
        title: "Roll",
        get_enabled: () => state.roll.enabled,
        on_toggle: (enabled) => update_state(current => ({
            ...current,
            roll: {...current.roll, enabled},
        })),
        mount_content: (content) => {
            content.append(
                create_labeled_input({
                    label: "Attack",
                    value: state.roll.attack,
                    placeholder: "str or $add(str,2)",
                    on_change: (attack) => update_state(current => ({
                        ...current,
                        roll: {...current.roll, attack},
                    })),
                }).field,
                create_labeled_select({
                    label: "Defense",
                    value: state.roll.defense,
                    options: DEFENSES.map(value => ({value, label: value})),
                    on_change: (defense) => update_state(current => ({
                        ...current,
                        roll: {...current.roll, defense},
                    })),
                }).field,
                create_instruction_list_editor({
                    label: "Before consequences",
                    get_instructions: () => state.roll.before_consequences,
                    on_change: (before_consequences) => update_state(current => ({
                        ...current,
                        roll: {...current.roll, before_consequences},
                    })),
                }),
                create_instruction_list_editor({
                    label: "Hit",
                    get_instructions: () => state.roll.hit,
                    on_change: (hit) => update_state(current => ({
                        ...current,
                        roll: {...current.roll, hit},
                    })),
                }),
                create_instruction_list_editor({
                    label: "Miss",
                    get_instructions: () => state.roll.miss,
                    on_change: (miss) => update_state(current => ({
                        ...current,
                        roll: {...current.roll, miss},
                    })),
                }),
            );
        },
    });

    const mount_effect_section = () => create_toggleable_section({
        title: "Effect",
        get_enabled: () => state.effect.enabled,
        on_toggle: (enabled) => update_state(current => ({
            ...current,
            effect: {...current.effect, enabled},
        })),
        mount_content: (content) => {
            content.append(create_instruction_list_editor({
                label: "Effect instructions",
                get_instructions: () => state.effect.instructions,
                on_change: (instructions) => update_state(current => ({
                    ...current,
                    effect: {...current.effect, instructions},
                })),
            }));
        },
    });

    mount_form();
    render_output();
};
