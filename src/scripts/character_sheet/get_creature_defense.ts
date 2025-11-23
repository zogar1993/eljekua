import type {Creature} from "scripts/battlegrid/creatures/Creature";
import type {ExprNumberResolved} from "scripts/expressions/evaluator/types";
import {get_creature_half_level} from "scripts/character_sheet/get_creature_half_level";
import {get_creature_attribute_mod} from "scripts/character_sheet/get_creature_attribute_mod";

export const get_creature_defense = ({creature, defense_code}: {
    creature: Creature,
    defense_code: DefenseCode
}): ExprNumberResolved => {
    if (DEFENSES.includes(defense_code)) {
        const parts: Array<ExprNumberResolved> = [
            RESOLVED_BASE_10,
            get_creature_half_level(creature),
            get_creature_attribute_mod(creature, get_attribute_bonus_from_defense({creature, defense_code}))
        ]
        return {
            type: "number_resolved",
            value: parts.reduce((result, param) => param.value + result, 0),
            params: parts,
            description: defense_code
        }
    }

    throw Error(`Invalid defense ${defense_code}`)
}
const get_attribute_bonus_from_defense = ({creature, defense_code}: {
    creature: Creature,
    defense_code: DefenseCode
}) => {
    switch (defense_code) {
        case "fortitude":
            return creature.data.attributes["str"] > creature.data.attributes["con"] ? "str" : "con"
        case "reflex":
            return creature.data.attributes["int"] > creature.data.attributes["dex"] ? "int" : "dex"
        case "will":
            return creature.data.attributes["wis"] > creature.data.attributes["cha"] ? "wis" : "cha"
        case "ac" :
            return creature.data.attributes["int"] > creature.data.attributes["dex"] ? "int" : "dex"
        default:
            throw Error(`defense_code '${defense_code}' is not valid`)
    }
}

const RESOLVED_BASE_10: ExprNumberResolved =
    Object.freeze({type: "number_resolved", value: 10, description: "base"})

export type DefenseCode = "ac" | "fortitude" | "reflex" | "will"

const DEFENSES: Array<DefenseCode> = ["ac", "fortitude", "reflex", "will"] as const
