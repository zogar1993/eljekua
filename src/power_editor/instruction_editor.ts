import {
    ADD_POWERS_COSTS,
    ADD_POWERS_FILTERS,
    INSTRUCTION_TYPES,
    MELEE_TARGET_TYPES,
    RANGED_TARGET_TYPES,
    STATUS_DURATION_VALUES,
    STATUS_TYPES,
    TARGETING_TYPES,
} from "power_editor/constants";
import {
    create_button,
    create_checkbox,
    create_checkbox_group,
    create_labeled_input,
    create_labeled_select,
} from "power_editor/form_controls";
import {
    create_default_instruction,
    create_instruction_id,
    type InstructionFormState,
} from "power_editor/form_state";
import {INSTRUCTION_TYPE} from "scripts/expressions/parser/instructions";
import {create_html_element} from "web_components/utils/create_html_element";

export const create_instruction_list_editor = ({
    label,
    get_instructions,
    on_change,
    depth = 0,
}: {
    label: string
    get_instructions: () => Array<InstructionFormState>
    on_change: (instructions: Array<InstructionFormState>) => void
    depth?: number
}) => {
    const container = create_html_element("div", "power-editor__instruction-list");
    container.style.setProperty("--instruction-depth", String(depth));

    const header = create_html_element("div", "power-editor__instruction-list-header");
    const title = create_html_element("div", "power-editor__label");
    title.textContent = label;
    header.append(title);

    const add_select = document.createElement("select");
    add_select.className = "power-editor__select";
    for (const type of INSTRUCTION_TYPES) {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        add_select.append(option);
    }
    const add_button = create_button({
        label: "Add instruction",
        on_click: () => {
            on_change([
                ...get_instructions(),
                create_default_instruction(add_select.value as typeof INSTRUCTION_TYPES[number]),
            ]);
            render_list();
        },
    });
    header.append(add_select, add_button);
    container.append(header);

    const list = create_html_element("div", "power-editor__instruction-list-items");

    const update_instruction = (index: number, next_instruction: InstructionFormState) => {
        const next_instructions = [...get_instructions()];
        next_instructions[index] = next_instruction;
        on_change(next_instructions);
    };

    const render_list = () => {
        list.replaceChildren();
        for (const [index] of get_instructions().entries()) {
            list.append(create_instruction_editor({
                get_instruction: () => get_instructions()[index],
                on_change: (next_instruction) => update_instruction(index, next_instruction),
                on_remove: () => {
                    on_change(get_instructions().filter((_, item_index) => item_index !== index));
                    render_list();
                },
                on_structure_change: () => render_list(),
                depth,
            }));
        }
    };

    render_list();
    container.append(list);
    return container;
};

const create_instruction_editor = ({
    get_instruction,
    on_change,
    on_remove,
    on_structure_change,
    depth,
}: {
    get_instruction: () => InstructionFormState
    on_change: (instruction: InstructionFormState) => void
    on_remove: () => void
    on_structure_change: () => void
    depth: number
}) => {
    const card = create_html_element("article", "power-editor__instruction-card");
    card.style.setProperty("--instruction-depth", String(depth));

    const header = create_html_element("div", "power-editor__instruction-card-header");
    const type_label = create_html_element("strong", "power-editor__instruction-type");
    header.append(type_label, create_button({label: "Remove", variant: "danger", on_click: on_remove}));
    card.append(header);

    const body = create_html_element("div", "power-editor__instruction-card-body");
    card.append(body);

    const refresh = () => {
        const instruction = get_instruction();
        type_label.textContent = instruction.type;
        body.replaceChildren();
        mount_instruction_body(body, get_instruction, on_change, on_structure_change, depth);
    };

    refresh();
    return card;
};

const mount_instruction_body = (
    body: HTMLElement,
    get_instruction: () => InstructionFormState,
    on_change: (instruction: InstructionFormState) => void,
    on_structure_change: () => void,
    depth: number,
) => {
    const instruction = get_instruction();

    const update = (patch: Partial<InstructionFormState>) => {
        on_change({...get_instruction(), ...patch} as InstructionFormState);
    };

    const structural_change = (next_instruction: InstructionFormState) => {
        on_change(next_instruction);
        on_structure_change();
    };

    switch (instruction.type) {
        case INSTRUCTION_TYPE.APPLY_DAMAGE:
            body.append(
                create_labeled_input({
                    label: "Value",
                    value: instruction.value,
                    placeholder: "$add({1W},owner.str_mod)",
                    on_change: (value) => update({value}),
                }).field,
                create_labeled_input({
                    label: "Target",
                    value: instruction.target,
                    on_change: (target) => update({target}),
                }).field,
                create_checkbox({
                    label: "Half damage",
                    checked: instruction.half_damage,
                    on_change: (half_damage) => update({half_damage}),
                }).field,
                create_labeled_input({
                    label: "Damage types (comma-separated)",
                    value: instruction.damage_types,
                    placeholder: "fire, force",
                    on_change: (damage_types) => update({damage_types}),
                }).field,
            );
            break;
        case INSTRUCTION_TYPE.SELECT_TARGET:
            body.append(
                create_labeled_input({
                    label: "Target label",
                    value: instruction.target_label,
                    on_change: (target_label) => update({target_label}),
                }).field,
                mount_targeting_fields({
                    get_fields: () => {
                        const current = get_instruction();
                        if (current.type !== INSTRUCTION_TYPE.SELECT_TARGET) {
                            throw new Error("Expected select_target instruction");
                        }
                        return current;
                    },
                    on_change: (fields) => on_change({...get_instruction(), ...fields} as InstructionFormState),
                    on_structure_change,
                }),
            );
            break;
        case INSTRUCTION_TYPE.MOVE:
        case INSTRUCTION_TYPE.SHIFT:
            body.append(
                create_labeled_input({
                    label: "Destination",
                    value: instruction.destination,
                    on_change: (destination) => update({destination}),
                }).field,
            );
            break;
        case INSTRUCTION_TYPE.CONDITION: {
            const false_branch_host = create_html_element("div", "power-editor__nested-instructions");
            body.append(
                create_labeled_input({
                    label: "Condition",
                    value: instruction.condition,
                    placeholder: "$exists(secondary_target)",
                    on_change: (condition) => update({condition}),
                }).field,
                create_checkbox({
                    label: "Has false branch",
                    checked: instruction.has_false_branch,
                    on_change: (has_false_branch) => structural_change({...get_instruction(), has_false_branch} as InstructionFormState),
                }).field,
                create_instruction_list_editor({
                    label: "Instructions when true",
                    get_instructions: () => {
                        const current = get_instruction();
                        return current.type === INSTRUCTION_TYPE.CONDITION ? current.instructions_true : [];
                    },
                    on_change: (instructions_true) => update({instructions_true}),
                    depth: depth + 1,
                }),
                false_branch_host,
            );
            if (instruction.has_false_branch) {
                false_branch_host.append(create_instruction_list_editor({
                    label: "Instructions when false",
                    get_instructions: () => {
                        const current = get_instruction();
                        return current.type === INSTRUCTION_TYPE.CONDITION ? current.instructions_false : [];
                    },
                    on_change: (instructions_false) => update({instructions_false}),
                    depth: depth + 1,
                }));
            }
            break;
        }
        case INSTRUCTION_TYPE.OPTIONS:
            body.append(create_options_editor({
                get_options: () => {
                    const current = get_instruction();
                    return current.type === INSTRUCTION_TYPE.OPTIONS ? current.options : [];
                },
                on_change: (options) => update({options}),
                on_structure_change,
                depth: depth + 1,
            }));
            break;
        case INSTRUCTION_TYPE.SAVE_VARIABLE:
        case INSTRUCTION_TYPE.SAVE_NUMBER_AS_RESOLVED:
            body.append(
                create_labeled_input({
                    label: "Value",
                    value: instruction.value,
                    on_change: (value) => update({value}),
                }).field,
                create_labeled_input({
                    label: "Label",
                    value: instruction.label,
                    on_change: (label) => update({label}),
                }).field,
            );
            break;
        case INSTRUCTION_TYPE.APPLY_STATUS:
            body.append(
                create_labeled_input({
                    label: "Target",
                    value: instruction.target,
                    on_change: (target) => update({target}),
                }).field,
                create_labeled_select({
                    label: "Duration mode",
                    value: instruction.duration_mode,
                    options: [
                        {value: "single", label: "Single"},
                        {value: "multiple", label: "Multiple"},
                    ],
                    on_change: (duration_mode) => structural_change({...get_instruction(), duration_mode} as InstructionFormState),
                }).field,
            );
            if (instruction.duration_mode === "single") {
                body.append(create_labeled_select({
                    label: "Duration",
                    value: instruction.duration,
                    options: STATUS_DURATION_VALUES.map(value => ({value, label: value})),
                    on_change: (duration) => update({duration}),
                }).field);
            } else {
                body.append(create_checkbox_group({
                    label: "Durations",
                    values: instruction.durations,
                    options: STATUS_DURATION_VALUES.map(value => ({value, label: value})),
                    on_change: (durations) => update({durations}),
                }));
            }
            body.append(
                create_labeled_select({
                    label: "Status type",
                    value: instruction.status_type,
                    options: STATUS_TYPES.map(value => ({value, label: value})),
                    on_change: (status_type) => structural_change({...get_instruction(), status_type} as InstructionFormState),
                }).field,
            );
            if (instruction.status_type !== "grant_combat_advantage") {
                body.append(create_labeled_input({
                    label: "Status value",
                    value: instruction.status_value,
                    on_change: (status_value) => update({status_value}),
                }).field);
            }
            body.append(create_labeled_input({
                label: "Against",
                value: instruction.against,
                on_change: (against) => update({against}),
            }).field);
            break;
        case INSTRUCTION_TYPE.ADD_POWERS_AS_OPTIONS:
            body.append(
                create_labeled_input({
                    label: "Creature",
                    value: instruction.creature,
                    on_change: (creature) => update({creature}),
                }).field,
                create_labeled_select({
                    label: "Cost",
                    value: instruction.cost,
                    options: ADD_POWERS_COSTS.map(value => ({value, label: value})),
                    on_change: (cost) => update({cost}),
                }).field,
                create_labeled_select({
                    label: "Filter",
                    value: instruction.filter,
                    options: ADD_POWERS_FILTERS.map(value => ({value, label: value})),
                    on_change: (filter) => update({filter}),
                }).field,
            );
            break;
        case "push":
            body.append(
                create_labeled_input({
                    label: "Amount",
                    value: instruction.amount,
                    type: "number",
                    on_change: (amount) => update({amount}),
                }).field,
                create_labeled_input({
                    label: "Target",
                    value: instruction.target,
                    on_change: (target) => update({target}),
                }).field,
            );
            break;
    }
};

const create_options_editor = ({
    get_options,
    on_change,
    on_structure_change,
    depth,
}: {
    get_options: () => Array<{id: string, text: string, instructions: Array<InstructionFormState>}>
    on_change: (options: Array<{id: string, text: string, instructions: Array<InstructionFormState>}>) => void
    on_structure_change: () => void
    depth: number
}) => {
    const container = create_html_element("div", "power-editor__options-editor");
    const title = create_html_element("div", "power-editor__label");
    title.textContent = "Options";
    container.append(title);

    const options_list = create_html_element("div", "power-editor__options-list");

    const render = () => {
        options_list.replaceChildren();
        for (const [index, option] of get_options().entries()) {
            const option_card = create_html_element("div", "power-editor__option-card");
            option_card.append(
                create_labeled_input({
                    label: "Option text",
                    value: option.text,
                    on_change: (text) => {
                        const next_options = [...get_options()];
                        next_options[index] = {...get_options()[index], text};
                        on_change(next_options);
                    },
                }).field,
                create_instruction_list_editor({
                    label: "Option instructions",
                    get_instructions: () => get_options()[index]?.instructions ?? [],
                    on_change: (instructions) => {
                        const next_options = [...get_options()];
                        next_options[index] = {...get_options()[index], instructions};
                        on_change(next_options);
                    },
                    depth,
                }),
                create_button({
                    label: "Remove option",
                    variant: "danger",
                    on_click: () => {
                        on_change(get_options().filter((_, item_index) => item_index !== index));
                        render();
                    },
                }),
            );
            options_list.append(option_card);
        }
    };

    render();
    container.append(
        options_list,
        create_button({
            label: "Add option",
            on_click: () => {
                on_change([...get_options(), {id: create_instruction_id(), text: "", instructions: []}]);
                render();
            },
        }),
    );

    return container;
};

type TargetingFields = {
    targeting_type: typeof TARGETING_TYPES[number]
    target_type: typeof MELEE_TARGET_TYPES[number] | typeof RANGED_TARGET_TYPES[number]
    distance: string
    radius: string
    destination_requirement: string
    terrain_prerequisite: "" | "unoccupied"
    exclude_primary_target: boolean
};

export const mount_targeting_fields = ({
    get_fields,
    on_change,
    on_structure_change,
}: {
    get_fields: () => TargetingFields
    on_change: (fields: TargetingFields) => void
    on_structure_change: () => void
}) => {
    const container = create_html_element("div", "power-editor__targeting-fields");

    const render = () => {
        container.replaceChildren(...build_targeting_field_elements({
            get_fields,
            on_change,
            on_structure_change: () => {
                on_structure_change();
                render();
            },
        }));
    };

    render();
    return container;
};

export const create_targeting_fields = (params: TargetingFields & {
    on_change: (fields: TargetingFields) => void
}) => build_targeting_field_elements({
    get_fields: () => params,
    on_change: params.on_change,
    on_structure_change: () => {},
});

const build_targeting_field_elements = ({
    get_fields,
    on_change,
    on_structure_change,
}: {
    get_fields: () => TargetingFields
    on_change: (fields: TargetingFields) => void
    on_structure_change: () => void
}) => {
    const fields: Array<HTMLElement> = [];
    const {targeting_type, target_type, distance, radius, destination_requirement, terrain_prerequisite, exclude_primary_target} = get_fields();

    fields.push(create_labeled_select({
        label: "Targeting type",
        value: targeting_type,
        options: TARGETING_TYPES.map(value => ({value, label: value})),
        on_change: (next_targeting_type) => {
            on_change({...get_fields(), targeting_type: next_targeting_type});
            on_structure_change();
        },
    }).field);

    switch (targeting_type) {
        case "adjacent":
        case "melee_weapon":
            fields.push(
                create_labeled_select({
                    label: "Target type",
                    value: target_type as typeof MELEE_TARGET_TYPES[number],
                    options: MELEE_TARGET_TYPES.map(value => ({value, label: value})),
                    on_change: (next_target_type) => on_change({...get_fields(), target_type: next_target_type}),
                }).field,
                create_checkbox({
                    label: "Exclude primary target",
                    checked: exclude_primary_target,
                    on_change: (next_exclude) => on_change({...get_fields(), exclude_primary_target: next_exclude}),
                }).field,
            );
            break;
        case "movement":
            fields.push(
                create_labeled_input({
                    label: "Distance",
                    value: distance,
                    placeholder: "1 or owner.movement",
                    on_change: (next_distance) => on_change({...get_fields(), distance: next_distance}),
                }).field,
                create_labeled_input({
                    label: "Destination requirement",
                    value: destination_requirement,
                    on_change: (next_requirement) => on_change({...get_fields(), destination_requirement: next_requirement}),
                }).field,
            );
            break;
        case "ranged":
            fields.push(
                create_labeled_select({
                    label: "Target type",
                    value: target_type as typeof RANGED_TARGET_TYPES[number],
                    options: RANGED_TARGET_TYPES.map(value => ({value, label: value})),
                    on_change: (next_target_type) => on_change({...get_fields(), target_type: next_target_type}),
                }).field,
                create_labeled_input({
                    label: "Distance",
                    value: distance,
                    on_change: (next_distance) => on_change({...get_fields(), distance: next_distance}),
                }).field,
                create_labeled_select({
                    label: "Terrain prerequisite",
                    value: terrain_prerequisite || "",
                    options: [
                        {value: "", label: "(none)"},
                        {value: "unoccupied", label: "unoccupied"},
                    ],
                    on_change: (next_prerequisite) => on_change({
                        ...get_fields(),
                        terrain_prerequisite: next_prerequisite as "" | "unoccupied",
                    }),
                }).field,
                create_checkbox({
                    label: "Exclude primary target",
                    checked: exclude_primary_target,
                    on_change: (next_exclude) => on_change({...get_fields(), exclude_primary_target: next_exclude}),
                }).field,
            );
            break;
        case "area_burst":
            fields.push(
                create_labeled_input({
                    label: "Distance",
                    value: distance,
                    type: "number",
                    on_change: (next_distance) => on_change({...get_fields(), distance: next_distance}),
                }).field,
                create_labeled_input({
                    label: "Radius",
                    value: radius,
                    type: "number",
                    on_change: (next_radius) => on_change({...get_fields(), radius: next_radius}),
                }).field,
            );
            break;
    }

    return fields;
};
