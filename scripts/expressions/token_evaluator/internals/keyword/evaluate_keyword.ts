import type {AstNode} from "expressions/token_evaluator/types";
import type {KeywordToken} from "expressions/tokenizer/tokens/KeywordToken";
import {ATTRIBUTE_CODES} from "character_sheet/attributes";
import type {Creature} from "battlegrid/creatures/Creature";
import type {AstNodeNumberResolved} from "expressions/token_evaluator/types";
import type {TurnContext} from "battlegrid/player_turn_handler/TurnContext";

export const build_evaluate_token_keyword = ({turn_context}: { turn_context: TurnContext }) => {
    return (token: KeywordToken): AstNode => {
        const variable_name = token.value
        const variable = turn_context.get_current_context().get_variable(variable_name)

        if (variable.type === "position")
            return {type: "position", value: variable.value, description: variable_name}

        if (variable.type === "creature") {
            const creature = variable.value

            if (token.property) {
                if (token.property === "position") {
                    const value = creature.data.position
                    const description = `${creature.data.name}'s position`
                    return {type: "position", value, description}
                }
                return {
                    type: "number_resolved",
                    ...preview_creature_property({creature, property: token.property}),
                }
            } else
                return {type: "creature", value: creature, description: creature.data.name}
        }

        if (variable.type === "creatures")
            return {type: "creatures", value: variable.value, description: token.value}

        if (variable.type === "resolved_number")
            return variable.value

        throw Error(`variable type '${variable.type}' not supported. Found while evaluating token keyword.`)
    }
}


const ATTRIBUTE_MOD_CODES = ATTRIBUTE_CODES.map(attribute => `${attribute}_mod`)
const ATTRIBUTE_MOD_CODES_LVL = ATTRIBUTE_CODES.map(attribute => `${attribute}_mod_lvl`)

const preview_creature_property = ({creature, property}: {
    creature: Creature,
    property: string
}): Omit<AstNodeNumberResolved, "type"> => {
    if (property === "movement")
        return {value: creature.data.movement, description: "movement"}

    if (ATTRIBUTE_MOD_CODES.includes(property))
        return preview_creature_attribute_mod(creature, property.slice(0, 3) as any)

    if (ATTRIBUTE_MOD_CODES_LVL.includes(property)) {
        const parts = [
            preview_creature_half_level(creature),
            preview_creature_attribute_mod(creature, property.slice(0, 3) as any)
        ]
        return {
            value: parts.reduce((result, part) => part.value + result, 0),
            description: property,
            params: parts
        }
    }

    throw Error(`Invalid property ${property}`)
}


const preview_creature_half_level = (creature: Creature): AstNodeNumberResolved =>
    ({type: "number_resolved", value: creature.half_level(), description: "half level"})

const preview_creature_attribute_mod = (creature: Creature, attribute: keyof Creature["data"]["attributes"]): AstNodeNumberResolved =>
    ({type: "number_resolved", value: creature.attribute_mod(attribute), description: `${attribute}_mod`})

//TODO move this to other file once we extract the character sheet helpers
export const preview_defense = ({defender, defense_code}: {
    defender: Creature,
    defense_code: string
}): AstNodeNumberResolved => {
    if (["ac", "fortitude", "reflex", "will"].includes(defense_code)) {
        const parts: Array<AstNodeNumberResolved> = [
            RESOLVED_BASE_10,
            preview_creature_half_level(defender),
            preview_creature_attribute_mod(defender, defender.data.attributes["dex"] > defender.data.attributes["int"] ? "dex" : "int")
        ]
        return {
            type: "number_resolved",
            value: parts.reduce((result, param) => param.value + result, 0),
            params: parts,
            description: "defense"
        }
    }

    throw Error(`Invalid defense ${defense_code}`)
}

const RESOLVED_BASE_10: AstNodeNumberResolved =
    Object.freeze({type: "number_resolved", value: 10, description: "base"})
