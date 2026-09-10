import type {Size} from "core/battlegrid/creatures/SIZES";
import {ATTRIBUTES, type AttributeCode} from "core/character_sheet/attributes";
import type {IRPower} from "core/types";
import {create_content_section, create_field_grid} from "web/content_editor/create_content_editor_layout";
import type {CreatureSetupDraft} from "web/visual_tests/creature_editor/creature_editor_defaults";
import {
    create_compact_text_input,
    create_number_input,
    create_select_input,
    read_number_value,
    read_select_value,
    read_text_value,
} from "web/visual_tests/power_editor/create_form_controls";
import {VISUAL_TEST_CREATURE_IMAGE_OPTIONS} from "web/visual_tests/visual_test_creature_images";
import {create_labeled_field} from "web/visual_tests/create_labeled_field";
import {create_html_element} from "web/core/utils/create_html_element";

const SIZE_OPTIONS: Array<{ value: Size, label: string }> = [
    {value: "tiny", label: "tiny"},
    {value: "small", label: "small"},
    {value: "medium", label: "medium"},
    {value: "large", label: "large"},
    {value: "huge", label: "huge"},
    {value: "gargantuan", label: "gargantuan"},
]

const ATTRIBUTE_CODES = Object.values(ATTRIBUTES)

export const create_creature_form = ({
                                         creature,
                                         get_available_powers,
                                     }: {
    creature: CreatureSetupDraft
    get_available_powers: () => Array<IRPower>
}) => {
    const html_root = create_html_element("div", "content-editor content-editor__form content-editor__form-scroll")

    const html_name = create_compact_text_input({value: creature.name})
    const html_team = create_compact_text_input({
        value: creature.team === null || creature.team === undefined ? "" : String(creature.team),
        placeholder: "neutral",
    })
    const html_level = create_number_input({value: creature.level ?? 1, compact: true})
    const html_template = create_compact_text_input({
        value: creature.template ?? "",
        placeholder: "optional",
    })

    const html_size = create_select_input({
        options: SIZE_OPTIONS,
        value: creature.size ?? "medium",
    })
    const html_movement = create_number_input({value: creature.movement ?? 5, compact: true})
    const html_hp_current = create_number_input({value: creature.hp_current ?? 10, compact: true})
    const html_hp_max = create_number_input({value: creature.hp_max ?? 10, compact: true})

    const html_attribute_inputs = new Map<AttributeCode, HTMLInputElement>()
    for (const attribute_code of ATTRIBUTE_CODES) {
        const value = creature.attributes?.[attribute_code] ?? 10
        html_attribute_inputs.set(attribute_code, create_number_input({value, compact: true}))
    }

    let selected_image = creature.image ?? VISUAL_TEST_CREATURE_IMAGE_OPTIONS[0].image
    const html_image_picker = create_html_element("div", "visual-tests__image-picker")

    const refresh_image_picker = () => {
        html_image_picker.querySelectorAll(".visual-tests__image-option").forEach(element => {
            element.classList.toggle(
                "visual-tests__image-option--selected",
                element instanceof HTMLElement && element.dataset["image"] === selected_image,
            )
        })
    }

    for (const option of VISUAL_TEST_CREATURE_IMAGE_OPTIONS) {
        const html_option = document.createElement("button")
        html_option.type = "button"
        html_option.className = "visual-tests__image-option"
        html_option.dataset["image"] = option.image
        html_option.title = option.label

        const html_preview = create_html_element("span", "visual-tests__image-option-preview")
        html_preview.style.backgroundImage = option.image

        const html_label = create_html_element("span", "visual-tests__image-option-label")
        html_label.textContent = option.label

        html_option.append(html_preview, html_label)
        html_option.addEventListener("click", () => {
            selected_image = option.image
            refresh_image_picker()
        })
        html_image_picker.append(html_option)
    }

    refresh_image_picker()

    const html_powers = create_html_element("select", "content-editor__select") as HTMLSelectElement
    html_powers.multiple = true

    const refresh_power_options = () => {
        const selected_names = new Set(
            Array.from(html_powers.selectedOptions).map(option => option.value),
        )
        const creature_power_names = new Set((creature.powers ?? []).map(power => power.name))
        html_powers.replaceChildren()
        for (const power of get_available_powers()) {
            const html_option = document.createElement("option")
            html_option.value = power.name
            html_option.textContent = power.name
            html_option.selected = selected_names.has(power.name) || creature_power_names.has(power.name)
            html_powers.append(html_option)
        }
    }

    refresh_power_options()

    const html_archetypes = create_compact_text_input({
        value: (creature.archetypes ?? []).join(", "),
        placeholder: "humanoid, beast",
    })

    html_root.append(
        create_content_section({
            title: "Basics",
            html_children: [
                create_field_grid([
                    create_labeled_field({label: "Name", control: html_name}),
                    create_labeled_field({label: "Team", control: html_team}),
                    create_labeled_field({label: "Level", control: html_level}),
                    create_labeled_field({label: "Template", control: html_template}),
                ]),
            ],
        }),
        create_content_section({
            title: "Stats",
            html_children: [
                create_field_grid([
                    create_labeled_field({label: "Size", control: html_size}),
                    create_labeled_field({label: "Movement", control: html_movement}),
                    create_labeled_field({label: "HP current", control: html_hp_current}),
                    create_labeled_field({label: "HP max", control: html_hp_max}),
                ]),
            ],
        }),
        create_content_section({
            title: "Attributes",
            html_children: [
                create_field_grid(ATTRIBUTE_CODES.map(attribute_code => create_labeled_field({
                    label: attribute_code,
                    control: html_attribute_inputs.get(attribute_code)!,
                }))),
            ],
        }),
        create_content_section({
            title: "Sprite",
            html_children: [html_image_picker],
        }),
        create_content_section({
            title: "Powers",
            html_children: [create_labeled_field({label: "Assigned powers", control: html_powers})],
        }),
        create_content_section({
            title: "Archetypes",
            html_children: [
                create_field_grid([
                    create_labeled_field({label: "Archetypes", control: html_archetypes}),
                ]),
            ],
        }),
    )

    const read_team = (): number | null => {
        const value = read_text_value(html_team)
        if (value === "") return null
        const team = Number(value)
        return Number.isFinite(team) ? team : null
    }

    const read_attributes = (): Record<AttributeCode, number> => {
        const attributes = {} as Record<AttributeCode, number>
        for (const attribute_code of ATTRIBUTE_CODES)
            attributes[attribute_code] = read_number_value(html_attribute_inputs.get(attribute_code)!)
        return attributes
    }

    const read_powers = (): Array<IRPower> => {
        const powers_by_name = new Map(get_available_powers().map(power => [power.name, power]))
        return Array.from(html_powers.selectedOptions)
            .map(option => powers_by_name.get(option.value))
            .filter((power): power is IRPower => power !== undefined)
    }

    const read_archetypes = (): Array<string> =>
        read_text_value(html_archetypes)
            .split(",")
            .map(archetype => archetype.trim())
            .filter(archetype => archetype.length > 0)

    const get_creature_draft = (): CreatureSetupDraft => {
        const result: CreatureSetupDraft = {
            name: read_text_value(html_name),
            team: read_team(),
            level: read_number_value(html_level),
            size: read_select_value<Size>(html_size),
            movement: read_number_value(html_movement),
            hp_current: read_number_value(html_hp_current),
            hp_max: read_number_value(html_hp_max),
            attributes: read_attributes(),
            image: selected_image,
            powers: read_powers(),
            archetypes: read_archetypes(),
        }

        const template = read_text_value(html_template)
        if (template)
            result.template = template
        else
            result.template = null

        return result
    }

    return {html_root, get_creature_draft, refresh_power_options}
}
