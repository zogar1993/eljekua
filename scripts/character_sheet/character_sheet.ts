import {ResolvedNumberValue} from "formulas/IntFormulaFromTokens";
import {Creature} from "battlegrid/creatures/Creature";

const resolve_half_level = ({creature}: { creature: Creature }): ResolvedNumberValue => ({
    value: Math.floor(creature.data.level / 2),
    description: "half level"
})

const resolve_attribute_mod = ({creature, attribute_code}: {
    creature: Creature,
    attribute_code: keyof Creature["data"]["attributes"]
}): ResolvedNumberValue => ({
    value: Math.floor((creature.data.attributes[attribute_code] - 10) / 2),
    description: `${attribute_code} mod`
})

const RESOLVED_BASE_10 = Object.freeze({value: 10, description: "base"})

export const get_attack = ({creature, attribute_code}: {
    creature: Creature,
    attribute_code: keyof Creature["data"]["attributes"]
}): Array<ResolvedNumberValue> => (
    [
        resolve_half_level({creature}),
        resolve_attribute_mod({creature, attribute_code})
    ]
)

export const get_defense = ({creature, defense_code}: {
    creature: Creature,
    defense_code: string
}): Array<ResolvedNumberValue> => (
    [
        RESOLVED_BASE_10,
        resolve_half_level({creature}),
        resolve_attribute_mod({
            creature,
            attribute_code: creature.data.attributes["dex"] > creature.data.attributes["int"] ? "dex" : "int"
        })
    ]
)
