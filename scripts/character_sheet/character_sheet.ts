import {ResolvedNumberValue} from "expression_parsers/parse_expression_to_number_values";
import {Creature} from "battlegrid/creatures/Creature";

const RESOLVED_BASE_10 = Object.freeze({value: 10, description: "base"})

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
