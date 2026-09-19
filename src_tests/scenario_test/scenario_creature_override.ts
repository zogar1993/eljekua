import type {Position} from "core/battlegrid/Position";
import {ATTRIBUTES, type AttributeCode} from "core/character_sheet/attributes";
import type {IRPower} from "core/types";
import {create_default_scenario_creature_setup} from "scenario_test/default_scenario_creature";
import type {ScenarioCreatureOverride, ScenarioCreatureSetup} from "scenario_test/ScenarioTest";

const records_equal = (left: Record<string, number>, right: Record<string, number>) =>
    JSON.stringify(left) === JSON.stringify(right)

const read_power_names = (powers: unknown): Array<string> | undefined => {
    if (!Array.isArray(powers) || powers.length === 0)
        return undefined

    const power_names = powers.map(power => {
        if (typeof power === "string")
            return power
        if (typeof power === "object" && power !== null && typeof (power as IRPower).name === "string")
            return (power as IRPower).name
        throw Error("creature powers must be power names or power objects with a name")
    })

    return power_names
}

const read_attributes = (attributes: unknown): Partial<Record<AttributeCode, number>> | undefined => {
    if (typeof attributes !== "object" || attributes === null)
        return undefined

    const partial_attributes: Partial<Record<AttributeCode, number>> = {}
    for (const attribute_code of Object.values(ATTRIBUTES)) {
        const value = (attributes as Record<string, unknown>)[attribute_code]
        if (typeof value === "number")
            partial_attributes[attribute_code] = value
    }

    return Object.keys(partial_attributes).length > 0 ? partial_attributes : undefined
}

const read_resistances = (resistances: unknown): Record<string, number> | undefined => {
    if (typeof resistances !== "object" || resistances === null)
        return undefined

    const result: Record<string, number> = {}
    for (const [damage_type, value] of Object.entries(resistances)) {
        if (typeof value === "number")
            result[damage_type] = value
    }

    return Object.keys(result).length > 0 ? result : undefined
}

export const resolve_creature_override = (
    override: ScenarioCreatureOverride,
    available_powers: Array<IRPower> = [],
): ScenarioCreatureSetup => {
    const defaults = create_default_scenario_creature_setup({
        name: override.name,
        position: override.position,
    })
    const powers_by_name = new Map(available_powers.map(power => [power.name, power]))
    const powers = (override.powers ?? []).map(power_name => {
        const power = powers_by_name.get(power_name)
        if (power !== undefined)
            return power
        if (available_powers.length > 0)
            throw Error(`power "${power_name}" is not available for creature "${override.name}"`)
        return {name: power_name} as IRPower
    })

    return {
        name: override.name.trim(),
        position: override.position,
        template: override.template ?? defaults.template,
        team: override.team ?? defaults.team,
        size: override.size ?? defaults.size,
        image: override.image ?? defaults.image,
        movement: override.movement ?? defaults.movement,
        hp_current: override.hp_current ?? defaults.hp_current,
        hp_max: override.hp_max ?? defaults.hp_max,
        level: override.level ?? defaults.level,
        attributes: {
            ...defaults.attributes,
            ...override.attributes,
        },
        powers,
        archetypes: override.archetypes ?? defaults.archetypes,
        resistances: override.resistances ?? defaults.resistances,
    }
}

export const compact_creature_override = (creature: ScenarioCreatureSetup): ScenarioCreatureOverride => {
    const defaults = create_default_scenario_creature_setup({
        name: creature.name,
        position: creature.position,
    })

    const override: ScenarioCreatureOverride = {
        name: creature.name.trim(),
        position: creature.position,
    }

    if (creature.template !== defaults.template)
        override.template = creature.template

    if (creature.team !== defaults.team)
        override.team = creature.team

    if (creature.size !== defaults.size)
        override.size = creature.size

    if (creature.image !== defaults.image)
        override.image = creature.image

    if (creature.movement !== defaults.movement)
        override.movement = creature.movement

    if (creature.hp_current !== defaults.hp_current)
        override.hp_current = creature.hp_current

    if (creature.hp_max !== defaults.hp_max)
        override.hp_max = creature.hp_max

    if (creature.level !== defaults.level)
        override.level = creature.level

    const changed_attributes = Object.fromEntries(
        Object.values(ATTRIBUTES)
            .filter(attribute_code => creature.attributes[attribute_code] !== defaults.attributes[attribute_code])
            .map(attribute_code => [attribute_code, creature.attributes[attribute_code]]),
    ) as Partial<Record<AttributeCode, number>>
    if (Object.keys(changed_attributes).length > 0)
        override.attributes = changed_attributes

    if (creature.powers.length > 0)
        override.powers = creature.powers.map(power => power.name)

    if (creature.archetypes.length > 0)
        override.archetypes = [...creature.archetypes]

    if (!records_equal(creature.resistances, defaults.resistances))
        override.resistances = {...creature.resistances}

    return override
}

export const normalize_creature_override = (raw: unknown): ScenarioCreatureOverride => {
    if (typeof raw !== "object" || raw === null)
        throw Error("creature must be an object")

    const creature = raw as Record<string, unknown>
    if (typeof creature.name !== "string" || creature.name.length === 0)
        throw Error("creature.name must be a non-empty string")

    if (typeof creature.position !== "object" || creature.position === null)
        throw Error("creature.position is required")

    const position = creature.position as Position
    if (typeof position.x !== "number" || typeof position.y !== "number")
        throw Error("creature.position must have numeric x and y")

    const override: ScenarioCreatureOverride = {
        name: creature.name,
        position,
    }

    if (creature.template !== undefined)
        override.template = creature.template as string | null

    if (creature.team !== undefined)
        override.team = creature.team as number | null

    if (typeof creature.size === "string")
        override.size = creature.size as ScenarioCreatureSetup["size"]

    if (typeof creature.image === "string")
        override.image = creature.image

    if (typeof creature.movement === "number")
        override.movement = creature.movement

    if (typeof creature.hp_current === "number")
        override.hp_current = creature.hp_current

    if (typeof creature.hp_max === "number")
        override.hp_max = creature.hp_max

    if (typeof creature.level === "number")
        override.level = creature.level

    const attributes = read_attributes(creature.attributes)
    if (attributes !== undefined)
        override.attributes = attributes

    const powers = read_power_names(creature.powers)
    if (powers !== undefined)
        override.powers = powers

    if (Array.isArray(creature.archetypes) && creature.archetypes.length > 0)
        override.archetypes = creature.archetypes.filter((archetype): archetype is string => typeof archetype === "string")

    const resistances = read_resistances(creature.resistances)
    if (resistances !== undefined)
        override.resistances = resistances

    return compact_creature_override(resolve_creature_override(override))
}

export const SCENARIO_CREATURE_OVERRIDE_LABEL_LINE_TYPE = {
    HEADER: "header",
    SECTION: "section",
    ENTRY: "entry",
} as const

export type ScenarioCreatureOverrideLabelLineType =
    typeof SCENARIO_CREATURE_OVERRIDE_LABEL_LINE_TYPE[keyof typeof SCENARIO_CREATURE_OVERRIDE_LABEL_LINE_TYPE]

export type ScenarioCreatureOverrideLabelLine = {
    type: ScenarioCreatureOverrideLabelLineType
    text: string
}

const append_scalar_section = ({
                                 lines,
                                 title,
                                 value,
                             }: {
    lines: Array<ScenarioCreatureOverrideLabelLine>
    title: string
    value: string | number
}) => {
    lines.push({type: SCENARIO_CREATURE_OVERRIDE_LABEL_LINE_TYPE.SECTION, text: title})
    lines.push({type: SCENARIO_CREATURE_OVERRIDE_LABEL_LINE_TYPE.ENTRY, text: String(value)})
}

const append_entry_section = ({
                                  lines,
                                  title,
                                  entries,
                              }: {
    lines: Array<ScenarioCreatureOverrideLabelLine>
    title: string
    entries: Array<string>
}) => {
    if (entries.length === 0)
        return

    lines.push({type: SCENARIO_CREATURE_OVERRIDE_LABEL_LINE_TYPE.SECTION, text: title})
    for (const entry of entries)
        lines.push({type: SCENARIO_CREATURE_OVERRIDE_LABEL_LINE_TYPE.ENTRY, text: entry})
}

export const get_scenario_creature_override_label_lines = (
    override: ScenarioCreatureOverride,
): Array<ScenarioCreatureOverrideLabelLine> => {
    const {position} = override
    const lines: Array<ScenarioCreatureOverrideLabelLine> = [
        {
            type: SCENARIO_CREATURE_OVERRIDE_LABEL_LINE_TYPE.HEADER,
            text: `${override.name} @(${position.x}, ${position.y})`,
        },
    ]

    if (override.template !== undefined)
        append_scalar_section({lines, title: "template", value: override.template ?? "null"})

    if (override.team !== undefined)
        append_scalar_section({lines, title: "team", value: override.team ?? "null"})

    if (override.size !== undefined)
        append_scalar_section({lines, title: "size", value: override.size})

    if (override.level !== undefined)
        append_scalar_section({lines, title: "level", value: override.level})

    if (override.movement !== undefined)
        append_scalar_section({lines, title: "movement", value: override.movement})

    if (override.hp_current !== undefined)
        append_scalar_section({lines, title: "hp_current", value: override.hp_current})

    if (override.hp_max !== undefined)
        append_scalar_section({lines, title: "hp_max", value: override.hp_max})

    if (override.attributes !== undefined) {
        append_entry_section({
            lines,
            title: "attributes",
            entries: Object.entries(override.attributes).map(([attribute, value]) => `${attribute} ${value}`),
        })
    }

    if (override.archetypes !== undefined) {
        append_entry_section({
            lines,
            title: "archetypes",
            entries: override.archetypes,
        })
    }

    if (override.resistances !== undefined) {
        append_entry_section({
            lines,
            title: "resistances",
            entries: Object.entries(override.resistances).map(([damage_type, value]) => `${damage_type} ${value}`),
        })
    }

    if (override.powers !== undefined) {
        append_entry_section({
            lines,
            title: "powers",
            entries: override.powers,
        })
    }

    return lines
}
