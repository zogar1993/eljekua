import {ACTION_TYPE, type ActionType} from "core/battlegrid/creatures/ActionType";
import type {DefenseCode} from "core/character_sheet/get_creature_defense";
import type {IRPower} from "core/types";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";
import {
    append_labeled_field,
    create_checkbox_input,
    create_number_input,
    create_select_input,
    create_text_input,
    create_textarea_input,
    read_number_value,
    read_select_value,
    read_text_value,
} from "web/visual_tests/power_editor/create_form_controls";
import {create_instruction_list_editor} from "web/visual_tests/power_editor/create_instruction_list_editor";
import {create_field_group_title, create_labeled_field} from "web/visual_tests/create_labeled_field";
import {create_html_element} from "web/utils/create_html_element";

const ACTION_TYPE_OPTIONS = Object.values(ACTION_TYPE).map(action => ({value: action, label: action}))

const COOLDOWN_OPTIONS = [
    {value: "at-will", label: "at-will"},
    {value: "encounter", label: "encounter"},
    {value: "daily", label: "daily"},
] as const

const DEFENSE_OPTIONS: Array<{ value: DefenseCode, label: string }> = [
    {value: "ac", label: "ac"},
    {value: "fortitude", label: "fortitude"},
    {value: "reflex", label: "reflex"},
    {value: "will", label: "will"},
]

const TARGETING_TYPE_OPTIONS = [
    {value: "none", label: "none"},
    {value: "movement", label: "movement"},
    {value: "melee_weapon", label: "melee_weapon"},
    {value: "adjacent", label: "adjacent"},
    {value: "ranged", label: "ranged"},
    {value: "area_burst", label: "area_burst"},
] as const

type TargetingTypeOption = typeof TARGETING_TYPE_OPTIONS[number]["value"]

const TARGET_TYPE_OPTIONS = [
    {value: "enemy", label: "enemy"},
    {value: "creature", label: "creature"},
    {value: "terrain", label: "terrain"},
] as const

const TRIGGER_TYPE_OPTIONS = [
    {value: "reaction", label: "reaction"},
    {value: "interruption", label: "interruption"},
] as const

const is_trigger_action = (action: ActionType) =>
    action === ACTION_TYPE.OPPORTUNITY || action === ACTION_TYPE.IMMEDIATE

export const create_power_form = ({
                                      power,
                                      on_remove,
                                  }: {
    power: IRPower
    on_remove: () => void
}) => {
    const html_root = create_html_element("details", "visual-tests__power-form") as HTMLDetailsElement
    html_root.open = true

    const html_summary = document.createElement("summary")
    html_summary.className = "visual-tests__power-form-summary"
    html_summary.textContent = power.name

    const html_body = create_html_element("div", "visual-tests__power-form-body")

    const html_name = create_text_input({value: power.name})
    const html_description = create_text_input({value: power.description ?? ""})
    const html_action = create_select_input({options: ACTION_TYPE_OPTIONS, value: power.type.action})
    const html_cooldown = create_select_input({options: [...COOLDOWN_OPTIONS], value: power.type.cooldown})
    const {html_label: html_attack_label, html_input: html_attack} = create_checkbox_input({
        checked: power.type.attack,
        label: "Attack power",
    })
    const {html_label: html_melee_trait_label, html_input: html_melee_trait} = create_checkbox_input({
        checked: power.type.traits?.includes("melee_basic_attack") ?? false,
        label: "Melee basic attack trait",
    })

    const initial_targeting_type: TargetingTypeOption = power.targeting?.targeting_type ?? "none"
    const html_targeting_type = create_select_input({options: [...TARGETING_TYPE_OPTIONS], value: initial_targeting_type})

    const html_movement_distance = create_text_input({
        value: power.targeting?.targeting_type === "movement" ? String(power.targeting.distance) : "owner.movement",
    })
    const html_melee_target_type = create_select_input({
        options: [...TARGET_TYPE_OPTIONS],
        value: power.targeting?.targeting_type === "melee_weapon" || power.targeting?.targeting_type === "adjacent"
            ? power.targeting.target_type
            : "enemy",
    })
    const html_ranged_distance = create_text_input({
        value: power.targeting?.targeting_type === "ranged" ? String(power.targeting.distance) : "6",
    })
    const html_ranged_target_type = create_select_input({
        options: [...TARGET_TYPE_OPTIONS],
        value: power.targeting?.targeting_type === "ranged" ? power.targeting.target_type : "enemy",
    })
    const html_area_distance = create_number_input({
        value: power.targeting?.targeting_type === "area_burst" ? power.targeting.distance : 10,
    })
    const html_area_radius = create_number_input({
        value: power.targeting?.targeting_type === "area_burst" ? power.targeting.radius : 1,
    })

    const html_trigger_type = create_select_input({
        options: [...TRIGGER_TYPE_OPTIONS],
        value: power.trigger?.type ?? "reaction",
    })
    const {html_label: html_intercepts_movement_label, html_input: html_intercepts_movement} = create_checkbox_input({
        checked: power.trigger?.intercepts.includes("movement") ?? true,
        label: "Intercepts movement",
    })
    const {html_label: html_intercepts_critical_hit_label, html_input: html_intercepts_critical_hit} = create_checkbox_input({
        checked: power.trigger?.intercepts.includes("critical_hit") ?? false,
        label: "Intercepts critical hit",
    })
    const html_trigger_conditions = create_textarea_input({
        value: (power.trigger?.conditions ?? []).join("\n"),
        rows: 4,
    })

    const html_roll_attack = create_text_input({value: power.roll?.attack ?? "str"})
    const html_roll_defense = create_select_input({
        options: DEFENSE_OPTIONS,
        value: power.roll?.defense ?? "ac",
    })

    const html_targeting_fields = create_html_element("div", "visual-tests__power-form-section")
    const html_trigger_fields = create_html_element("div", "visual-tests__power-form-section")
    const html_roll_fields = create_html_element("div", "visual-tests__power-form-section")

    const effect_editor = create_instruction_list_editor({
        title: "Effect instructions",
        instructions: power.effect ?? [],
    })
    const hit_editor = create_instruction_list_editor({
        title: "Hit instructions",
        instructions: power.roll?.hit ?? [],
    })
    const miss_editor = create_instruction_list_editor({
        title: "Miss instructions",
        instructions: power.roll?.miss ?? [],
    })

    const html_remove_button = document.createElement("button")
    html_remove_button.type = "button"
    html_remove_button.className = "visual-tests__button visual-tests__button--small"
    html_remove_button.textContent = "Remove power"
    html_remove_button.addEventListener("click", on_remove)

    const refresh_targeting_fields = () => {
        html_targeting_fields.replaceChildren()
        append_labeled_field({container: html_targeting_fields, label: "Targeting type", control: html_targeting_type})

        const targeting_type = read_select_value<TargetingTypeOption>(html_targeting_type)
        switch (targeting_type) {
            case "movement":
                append_labeled_field({container: html_targeting_fields, label: "Distance", control: html_movement_distance})
                break
            case "melee_weapon":
            case "adjacent":
                append_labeled_field({container: html_targeting_fields, label: "Target type", control: html_melee_target_type})
                break
            case "ranged":
                append_labeled_field({container: html_targeting_fields, label: "Distance", control: html_ranged_distance})
                append_labeled_field({container: html_targeting_fields, label: "Target type", control: html_ranged_target_type})
                break
            case "area_burst":
                append_labeled_field({container: html_targeting_fields, label: "Distance", control: html_area_distance})
                append_labeled_field({container: html_targeting_fields, label: "Radius", control: html_area_radius})
                break
        }
    }

    const refresh_trigger_fields = () => {
        const action = read_select_value<ActionType>(html_action)
        html_trigger_fields.hidden = !is_trigger_action(action)
        if (!is_trigger_action(action)) return

        html_trigger_fields.replaceChildren()
        append_labeled_field({container: html_trigger_fields, label: "Trigger type", control: html_trigger_type})
        html_trigger_fields.append(html_intercepts_movement_label, html_intercepts_critical_hit_label)
        append_labeled_field({
            container: html_trigger_fields,
            label: "Conditions (one per line)",
            control: html_trigger_conditions,
        })
    }

    const refresh_roll_fields = () => {
        html_roll_fields.hidden = !html_attack.checked
        if (!html_attack.checked) return

        html_roll_fields.replaceChildren()
        append_labeled_field({container: html_roll_fields, label: "Attack", control: html_roll_attack})
        append_labeled_field({container: html_roll_fields, label: "Defense", control: html_roll_defense})
        html_roll_fields.append(hit_editor.html_root, miss_editor.html_root)
    }

    const refresh_summary = () => {
        html_summary.textContent = read_text_value(html_name) || "Unnamed power"
    }

    html_name.addEventListener("input", refresh_summary)
    html_targeting_type.addEventListener("change", refresh_targeting_fields)
    html_action.addEventListener("change", () => {
        refresh_trigger_fields()
        refresh_roll_fields()
    })
    html_attack.addEventListener("change", refresh_roll_fields)

    refresh_targeting_fields()
    refresh_trigger_fields()
    refresh_roll_fields()

    html_body.append(
        create_labeled_field({label: "Name", control: html_name}),
        create_labeled_field({label: "Description", control: html_description}),
        create_field_group_title("Type"),
        create_labeled_field({label: "Action", control: html_action}),
        create_labeled_field({label: "Cooldown", control: html_cooldown}),
        html_attack_label,
        html_melee_trait_label,
        create_field_group_title("Targeting"),
        html_targeting_fields,
        create_field_group_title("Trigger"),
        html_trigger_fields,
        create_field_group_title("Attack roll"),
        html_roll_fields,
        effect_editor.html_root,
        html_remove_button,
    )

    html_root.append(html_summary, html_body)

    const parse_distance = (value: string): string | number => {
        const trimmed = value.trim()
        if (trimmed === "") return 0
        const as_number = Number(trimmed)
        return Number.isFinite(as_number) ? as_number : trimmed
    }

    const get_targeting = (): IRPower["targeting"] => {
        const targeting_type = read_select_value<TargetingTypeOption>(html_targeting_type)
        switch (targeting_type) {
            case "movement":
                return {
                    targeting_type: "movement",
                    distance: parse_distance(read_text_value(html_movement_distance)),
                }
            case "melee_weapon":
                return {
                    targeting_type: "melee_weapon",
                    target_type: read_select_value(html_melee_target_type),
                    amount: 1,
                }
            case "adjacent":
                return {
                    targeting_type: "adjacent",
                    target_type: read_select_value(html_melee_target_type),
                    amount: 1,
                }
            case "ranged":
                return {
                    targeting_type: "ranged",
                    target_type: read_select_value(html_ranged_target_type),
                    amount: 1,
                    distance: parse_distance(read_text_value(html_ranged_distance)),
                }
            case "area_burst":
                return {
                    targeting_type: "area_burst",
                    target_type: "creature",
                    amount: "all",
                    distance: read_number_value(html_area_distance),
                    radius: read_number_value(html_area_radius),
                }
            case "none":
            default:
                return undefined
        }
    }

    const get_trigger = (): IRPower["trigger"] => {
        const action = read_select_value<ActionType>(html_action)
        if (!is_trigger_action(action)) return undefined

        const intercepts: Array<"movement" | "critical_hit"> = []
        if (html_intercepts_movement.checked) intercepts.push("movement")
        if (html_intercepts_critical_hit.checked) intercepts.push("critical_hit")

        const conditions = read_text_value(html_trigger_conditions)
            .split("\n")
            .map(line => line.trim())
            .filter(line => line.length > 0)

        return {
            type: read_select_value(html_trigger_type),
            intercepts,
            conditions,
        }
    }

    const get_power = (): IRPower => {
        const name = read_text_value(html_name)
        const description = read_text_value(html_description)
        const action = read_select_value<ActionType>(html_action)
        const cooldown = read_select_value<"at-will" | "encounter" | "daily">(html_cooldown)
        const attack = html_attack.checked
        const traits = html_melee_trait.checked ? ["melee_basic_attack"] as Array<"melee_basic_attack"> : undefined

        const result: IRPower = {
            name,
            type: {action, cooldown, attack, traits},
        }

        if (description) result.description = description

        const targeting = get_targeting()
        if (targeting) result.targeting = targeting

        const trigger = get_trigger()
        if (trigger) result.trigger = trigger

        if (attack) {
            result.roll = {
                attack: read_text_value(html_roll_attack),
                defense: read_select_value(html_roll_defense),
                hit: hit_editor.get_instructions(),
            }
            const miss_instructions = miss_editor.get_instructions()
            if (miss_instructions.length > 0)
                result.roll.miss = miss_instructions
        }

        const effect_instructions = effect_editor.get_instructions()
        if (effect_instructions.length > 0)
            result.effect = effect_instructions

        return result
    }

    return {html_root, get_power}
}
