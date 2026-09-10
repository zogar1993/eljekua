import type {IRInstruction} from "core/types";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";
import {create_default_instruction} from "web/visual_tests/power_editor/power_editor_defaults";
import {
    append_labeled_field,
    create_checkbox_input,
    create_select_input,
    create_text_input,
    read_select_value,
    read_text_value,
} from "web/visual_tests/power_editor/create_form_controls";
import {
    create_content_button,
    CONTENT_EDITOR_BUTTON_SIZE,
    CONTENT_EDITOR_BUTTON_VARIANT,
} from "web/content_editor/create_content_button";
import {create_labeled_field} from "web/visual_tests/create_labeled_field";
import {create_html_element} from "web/core/utils/create_html_element";

const INSTRUCTION_TYPE_OPTIONS: Array<{ value: IRInstruction["type"], label: string }> = [
    {value: INSTRUCTION_TYPE.APPLY_DAMAGE, label: "apply_damage"},
    {value: INSTRUCTION_TYPE.MOVE, label: "move"},
    {value: INSTRUCTION_TYPE.SHIFT, label: "shift"},
    {value: INSTRUCTION_TYPE.ADD_POWERS_AS_OPTIONS, label: "add_powers_as_options"},
]

const ADD_POWERS_COST_OPTIONS = [
    {value: "normal", label: "normal"},
    {value: "opportunity", label: "opportunity"},
    {value: "free_attack", label: "free_attack"},
] as const

const ADD_POWERS_FILTER_OPTIONS = [
    {value: "turn", label: "turn"},
    {value: "melee_basic_attack", label: "melee_basic_attack"},
] as const

export const create_instruction_editor = ({
                                              instruction,
                                              on_remove,
                                          }: {
    instruction: IRInstruction
    on_remove: () => void
}) => {
    const html_root = create_html_element("div", "content-editor__instruction-card")

    const html_type = create_select_input({
        options: INSTRUCTION_TYPE_OPTIONS,
        value: instruction.type,
    })

    const html_apply_damage_value = create_text_input({
        value: instruction.type === INSTRUCTION_TYPE.APPLY_DAMAGE ? instruction.value : "$add({1W},owner.str_mod)",
    })
    const html_apply_damage_target = create_text_input({
        value: instruction.type === INSTRUCTION_TYPE.APPLY_DAMAGE ? instruction.target : "primary_target",
    })
    const {html_label: html_half_damage_label, html_input: html_half_damage} = create_checkbox_input({
        checked: instruction.type === INSTRUCTION_TYPE.APPLY_DAMAGE ? instruction.half_damage ?? false : false,
        label: "Half damage",
    })
    const html_damage_types = create_text_input({
        value: instruction.type === INSTRUCTION_TYPE.APPLY_DAMAGE
            ? (instruction.damage_types ?? []).join(", ")
            : "",
        placeholder: "force, fire",
    })

    const html_movement_destination = create_text_input({value: "primary_target"})

    const html_add_powers_creature = create_text_input({
        value: instruction.type === INSTRUCTION_TYPE.ADD_POWERS_AS_OPTIONS ? instruction.creature : "owner",
    })
    const html_add_powers_cost = create_select_input({
        options: [...ADD_POWERS_COST_OPTIONS],
        value: instruction.type === INSTRUCTION_TYPE.ADD_POWERS_AS_OPTIONS ? instruction.cost : "opportunity",
    })
    const html_add_powers_filter = create_select_input({
        options: [...ADD_POWERS_FILTER_OPTIONS],
        value: instruction.type === INSTRUCTION_TYPE.ADD_POWERS_AS_OPTIONS ? instruction.filter : "melee_basic_attack",
    })

    const html_fields = create_html_element("div", "content-editor__section-body")

    const html_remove_button = create_content_button({
        text: "Remove instruction",
        variant: CONTENT_EDITOR_BUTTON_VARIANT.DANGER,
        size: CONTENT_EDITOR_BUTTON_SIZE.SMALL,
        on_click: on_remove,
    })

    const refresh_fields = () => {
        html_fields.replaceChildren()
        const type = read_select_value(html_type)

        switch (type) {
            case INSTRUCTION_TYPE.APPLY_DAMAGE:
                append_labeled_field({container: html_fields, label: "Damage value", control: html_apply_damage_value})
                append_labeled_field({container: html_fields, label: "Target", control: html_apply_damage_target})
                html_fields.append(html_half_damage_label)
                append_labeled_field({
                    container: html_fields,
                    label: "Damage types (comma-separated)",
                    control: html_damage_types,
                })
                break
            case INSTRUCTION_TYPE.MOVE:
            case INSTRUCTION_TYPE.SHIFT:
                append_labeled_field({container: html_fields, label: "Destination", control: html_movement_destination})
                break
            case INSTRUCTION_TYPE.ADD_POWERS_AS_OPTIONS:
                append_labeled_field({container: html_fields, label: "Creature", control: html_add_powers_creature})
                append_labeled_field({container: html_fields, label: "Cost", control: html_add_powers_cost})
                append_labeled_field({container: html_fields, label: "Filter", control: html_add_powers_filter})
                break
        }
    }

    html_type.addEventListener("change", () => {
        const type = read_select_value<IRInstruction["type"]>(html_type)
        const defaults = create_default_instruction(type)
        if (defaults.type === INSTRUCTION_TYPE.APPLY_DAMAGE) {
            html_apply_damage_value.value = defaults.value
            html_apply_damage_target.value = defaults.target
            html_half_damage.checked = false
            html_damage_types.value = ""
        }
        if (defaults.type === INSTRUCTION_TYPE.ADD_POWERS_AS_OPTIONS) {
            html_add_powers_creature.value = defaults.creature
            html_add_powers_cost.value = defaults.cost
            html_add_powers_filter.value = defaults.filter
        }
        refresh_fields()
    })

    refresh_fields()

    html_root.append(
        create_labeled_field({label: "Instruction type", control: html_type}),
        html_fields,
        html_remove_button,
    )

    const read_damage_types = (): Array<string> =>
        read_text_value(html_damage_types)
            .split(",")
            .map(type => type.trim())
            .filter(type => type.length > 0)

    const get_instruction = (): IRInstruction => {
        const type = read_select_value(html_type)
        switch (type) {
            case INSTRUCTION_TYPE.APPLY_DAMAGE: {
                const result: Extract<IRInstruction, { type: typeof INSTRUCTION_TYPE.APPLY_DAMAGE }> = {
                    type,
                    value: read_text_value(html_apply_damage_value),
                    target: read_text_value(html_apply_damage_target),
                }
                if (html_half_damage.checked)
                    result.half_damage = true
                const damage_types = read_damage_types()
                if (damage_types.length > 0)
                    result.damage_types = damage_types
                return result
            }
            case INSTRUCTION_TYPE.MOVE:
            case INSTRUCTION_TYPE.SHIFT:
                return {
                    type,
                    target: "owner",
                    destination: read_text_value(html_movement_destination),
                }
            case INSTRUCTION_TYPE.ADD_POWERS_AS_OPTIONS:
                return {
                    type,
                    creature: read_text_value(html_add_powers_creature),
                    cost: read_select_value(html_add_powers_cost),
                    filter: read_select_value(html_add_powers_filter),
                }
            default:
                return create_default_instruction(INSTRUCTION_TYPE.APPLY_DAMAGE)
        }
    }

    return {html_root, get_instruction}
}
