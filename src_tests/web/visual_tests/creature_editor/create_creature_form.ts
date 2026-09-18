import type {Size} from "core/battlegrid/creatures/SIZES";
import {ATTRIBUTES, type AttributeCode} from "core/character_sheet/attributes";
import type {IRPower} from "core/types";
import {create_content_section, create_field_grid} from "web/content_editor/create_content_editor_layout";
import type {CreatureSetupDraft} from "web/visual_tests/creature_editor/creature_editor_defaults";
import {create_creature_power_picker} from "web/visual_tests/creature_editor/create_creature_power_picker";
import {create_resistance_list_editor} from "web/visual_tests/creature_editor/create_resistance_list_editor";
import {create_team_picker} from "web/visual_tests/creature_editor/create_team_picker";
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

    const html_name = create_compact_text_input({
        value: creature.name,
        placeholder: "required",
    })
    const team_picker = create_team_picker({value: creature.team ?? null})
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

        html_option.append(html_preview)
        html_option.addEventListener("click", () => {
            selected_image = option.image
            refresh_image_picker()
        })
        html_image_picker.append(html_option)
    }

    refresh_image_picker()

    const power_picker = create_creature_power_picker({
        selected_powers: creature.powers ?? [],
        get_available_powers,
    })

    const html_archetypes = create_compact_text_input({
        value: (creature.archetypes ?? []).join(", "),
        placeholder: "humanoid, beast",
    })

    const resistance_list_editor = create_resistance_list_editor({
        resistances: creature.resistances ?? {},
    })

    html_root.append(
        create_content_section({
            title: "Basics",
            html_children: [
                create_field_grid([
                    create_labeled_field({label: "Name", control: html_name}),
                    create_labeled_field({label: "Team", control: team_picker.html_root}),
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
                })), 6),
            ],
        }),
        create_content_section({
            title: "Sprite",
            html_children: [html_image_picker],
        }),
        create_content_section({
            title: "Powers",
            html_children: [power_picker.html_root],
        }),
        create_content_section({
            title: "Archetypes",
            html_children: [
                create_field_grid([
                    create_labeled_field({label: "Archetypes", control: html_archetypes}),
                ]),
            ],
        }),
        create_content_section({
            title: "Resistances",
            html_children: [resistance_list_editor.html_root],
        }),
    )

    const read_attributes = (): Record<AttributeCode, number> => {
        const attributes = {} as Record<AttributeCode, number>
        for (const attribute_code of ATTRIBUTE_CODES)
            attributes[attribute_code] = read_number_value(html_attribute_inputs.get(attribute_code)!)
        return attributes
    }

    const read_archetypes = (): Array<string> =>
        read_text_value(html_archetypes)
            .split(",")
            .map(archetype => archetype.trim())
            .filter(archetype => archetype.length > 0)

    const get_creature_draft = (): CreatureSetupDraft => {
        const result: CreatureSetupDraft = {
            name: read_text_value(html_name).trim(),
            team: team_picker.get_team(),
            level: read_number_value(html_level),
            size: read_select_value<Size>(html_size),
            movement: read_number_value(html_movement),
            hp_current: read_number_value(html_hp_current),
            hp_max: read_number_value(html_hp_max),
            attributes: read_attributes(),
            image: selected_image,
            powers: power_picker.get_selected_powers(),
            archetypes: read_archetypes(),
        }

        const template = read_text_value(html_template)
        if (template)
            result.template = template
        else
            result.template = null

        const resistances = resistance_list_editor.get_resistances()
        if (Object.keys(resistances).length > 0)
            result.resistances = resistances

        return result
    }

    return {html_root, get_creature_draft, refresh_power_options: power_picker.refresh_power_options}
}
