import {get_random_number} from "randomness/dice";
import {assert} from "assert";
import {Creature} from "battlegrid/creatures/Creature";
import {ActivePowerContext} from "battlegrid/player_turn_handler/PlayerTurnHandler";
import {KeywordToken} from "tokenizer/tokens/KeywordToken";
import {Token} from "tokenizer/tokens/AnyToken";
import {FunctionToken} from "tokenizer/tokens/FunctionToken";
import {NumberToken} from "tokenizer/tokens/NumberToken";
import {StringToken} from "tokenizer/tokens/StringToken";
import {DiceToken, WeaponToken} from "tokenizer/tokens/DiceToken";

type PreviewExpressionProps<T extends Token> = { token: T, context: ActivePowerContext }

export const resolve_number = (number: ExpressionResultNumber): ExpressionResultNumberResolved => {
    if (is_number_resolved(number)) return number
    if (number.params === undefined)
        return {
            type: "number_resolved",
            value: get_random_number(number),
            description: number.description
        }
    const resolved_parts = number.params.map(part => is_number(part) ? resolve_number(part) : part)
    return {
        type: "number_resolved",
        value: resolved_parts.reduce((result, part) => is_number(part) ? part.value + result : result, 0),
        description: number.description,
        params: resolved_parts
    }
}

export const preview_expression = ({token, context}: PreviewExpressionProps<Token>): ExpressionResult => {
    switch (token.type) {
        case "function":
            return preview_function({token, context})
        case "number":
            return preview_number({token, context})
        case "string":
            return preview_string({token, context})
        case "weapon":
            return preview_weapon({token, context})
        case "dice":
            return preview_dice({token, context})
        case "keyword":
            return preview_keyword({token, context})
    }
}

const preview_keyword = ({token, context}: PreviewExpressionProps<KeywordToken>): ExpressionResult => {
    const creature = context.get_creature(token.value)

    if (token.property)
        return {
            type: "number_resolved",
            ...preview_creature_property({creature, property: token.property}),
        }
    else
        return {
            type: "creature",
            value: creature,
            description: creature.data.name
        }
}

const preview_creature_property = ({creature, property}: {
    creature: Creature,
    property: string
}): Omit<ExpressionResultNumberResolved, "type"> => {
    const attributes = ["str", "con", "dex", "int", "wis", "cha"]
    if (property === "movement") return {
        value: creature.data.movement,
        description: "movement"
    }
    //TODO clean up the attribute mess
    //TODO clean up the creature functions mess
    if (attributes.some(attribute => `${attribute}_mod` === property))
        return preview_creature_attribute_mod(creature, property.slice(0, 3) as any)
    if (attributes.some(attribute => `${attribute}_mod_lvl` === property)) {
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

const preview_creature_half_level = (creature: Creature): ExpressionResultNumberResolved => ({
    type: "number_resolved",
    value: creature.half_level(),
    description: "half level"
})

const preview_creature_attribute_mod = (creature: Creature, attribute: keyof Creature["data"]["attributes"]): ExpressionResultNumberResolved => ({
    type: "number_resolved",
    value: creature.attribute_mod(attribute),
    description: `${attribute}_mod`
})

export const preview_defense = ({defender, defense_code}: {defender: Creature, defense_code: string}): ExpressionResultNumberResolved => {
    if (["ac", "fortitude", "reflex", "will"].includes(defense_code)) {
        const parts: Array<ExpressionResultNumberResolved> = [
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


const RESOLVED_BASE_10: ExpressionResultNumberResolved = Object.freeze({
    type: "number_resolved",
    value: 10,
    description: "base"
})

const preview_dice = ({token}: PreviewExpressionProps<DiceToken>): ExpressionResultNumberUnresolved => {
    return {
        type: "number_unresolved",
        min: 1,
        max: token.faces,
        description: `${token.faces}d${token.faces}`
    }
}

const preview_weapon = ({token}: PreviewExpressionProps<WeaponToken>): ExpressionResultNumberUnresolved => {
    return {
        type: "number_unresolved",
        min: 1,
        max: 4,
        description: `${token.amount}W`
    }
}

const preview_string = ({token}: PreviewExpressionProps<StringToken>): ExpressionResultString => {
    return {
        type: "string",
        value: token.value,
        description: token.value,
    }
}

const preview_number = ({token}: PreviewExpressionProps<NumberToken>): ExpressionResultNumberResolved => {
    return {
        type: "number_resolved",
        value: token.value,
        description: "hard number"
    }
}

const preview_function = ({token, context}: PreviewExpressionProps<FunctionToken>): ExpressionResult => {
    switch (token.name) {
        case "add":
            return preview_add_function({token, context})
        case "exists": {
            assert(token.parameters.length === 1, () => "exists function needs exactly one parameter")
            const parameter = token.parameters[0]
            if (parameter.type === "keyword") {
                return {
                    type: "boolean",
                    value: context.has_variable(parameter.value),
                    description: `exists ${parameter.value}`,
                }
            } else
                throw Error("exists only works on keywords")

        }
        case "equipped": {
            assert(token.parameters.length === 2, () => "equipped function needs exactly two parameter")

            const parameter1 = token.parameters[0]
            if (parameter1.type !== "keyword") throw Error("first parameter must be a keyword")
            const creature = preview_keyword({token: parameter1, context})
            if (creature.type !== "creature") throw Error("first parameter must evaluate to a creature")

            const parameter2 = token.parameters[1]
            if (parameter2.type !== "string") throw Error("second parameter must be a string")
            const text = preview_string({token: parameter2, context})

            return {
                type: "boolean",
                value: creature.value.has_equipped(text.value),
                description: "equipped",
                params: [creature, text]
            }
        }
        default:
            throw Error(`function name ${token.name} not supported`)
    }
}

const preview_add_function = ({token, context}: PreviewExpressionProps<FunctionToken>): ExpressionResultNumber => {
    const params = token.parameters.map(parameter => preview_expression({token: parameter, context}))

    if (are_all_numbers_unresolved(params))
        return {
            type: "number_resolved",
            value: params.reduce((result, param) => param.value + result, 0),
            params: params,
            description: "+"
        }

    if (are_all_numbers(params))
        return {
            type: "number_unresolved",
            min: params.reduce((result, param) => (is_number_resolved(param) ? param.value : param.min) + result, 0),
            max: params.reduce((result, param) => (is_number_resolved(param) ? param.value : param.max) + result, 0),
            params: params,
            description: "+"
        }
    console.log(params)
    throw Error(`not all params evaluate to numbers on add function`)
}

export type ExpressionResult =
    ExpressionResultNumber
    | ExpressionResultString
    | ExpressionResultBoolean
    | ExpressionResultCreature

export type ExpressionResultString = {
    type: "string",
    value: string
    description: string
}

export type ExpressionResultNumber = ExpressionResultNumberUnresolved | ExpressionResultNumberResolved

export type ExpressionResultNumberUnresolved = {
    type: "number_unresolved"
    min: number
    max: number
    description: string
    params?: Array<ExpressionResult>
}

export type ExpressionResultNumberResolved = {
    type: "number_resolved"
    value: number
    description: string
    params?: Array<ExpressionResult>
}

export type ExpressionResultCreature = {
    type: "creature"
    value: Creature
    description: string
}

export type ExpressionResultBoolean = {
    type: "boolean"
    value: boolean
    description: string
    params?: Array<ExpressionResult>
}

const are_all_numbers = (values: Array<ExpressionResult>): values is Array<ExpressionResultNumber> =>
    values.every(is_number)

const are_all_numbers_unresolved = (values: Array<ExpressionResult>): values is Array<ExpressionResultNumberResolved> =>
    values.every(is_number_resolved)

const is_number_resolved = (value: ExpressionResult): value is ExpressionResultNumberResolved =>
    value.type === "number_resolved"

const is_number_unresolved = (value: ExpressionResult): value is ExpressionResultNumberUnresolved =>
    value.type === "number_unresolved"

export const is_number = (value: ExpressionResult): value is ExpressionResultNumber =>
    is_number_resolved(value) || is_number_unresolved(value)
