import {ResolvedNumberValue} from "formulas/IntFormulaFromTokens";
import {Creature} from "battlegrid/creatures/Creature";

const RESOLVED_BASE_10 = Object.freeze({value: 10, description: "base"})

export const get_attack = ({creature, attribute_code}: {
    creature: Creature,
    attribute_code: keyof Creature["data"]["attributes"]
}): Array<ResolvedNumberValue> => (
    [
        creature.resolve_half_level(),
        creature.resolve_attribute_mod(attribute_code)
    ]
)

export const get_defense = ({creature, defense_code}: {
    creature: Creature,
    defense_code: string
}): Array<ResolvedNumberValue> => (
    [
        RESOLVED_BASE_10,
        creature.resolve_half_level(),
        creature.resolve_attribute_mod(creature.data.attributes["dex"] > creature.data.attributes["int"] ? "dex" : "int")
    ]
)
