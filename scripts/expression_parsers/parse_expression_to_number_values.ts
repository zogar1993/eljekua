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

export const parse_expression_to_number_values = ({token, context}: {
    token: Token,
    context: ActivePowerContext
}): Array<NumberValue> => {
    return token.type === "function" && token.name === "add" ?
        token.parameters.map(parameter => parse_token({token: parameter, context})) :
        [parse_token({token, context})]
}

export const parse_expression_to_resolved_number_values = ({token, context}: {
    token: Token,
    context: ActivePowerContext
}): Array<ResolvedNumberValue> => {
    const number_values = token.type === "function" && token.name === "add" ?
        token.parameters.map(parameter => parse_token({token: parameter, context})) :
        [parse_token({token, context})]

    assert(number_values.every(x => is_resolved_number_value(x)), () => "found unresolved number values")
    return number_values as Array<ResolvedNumberValue>
}

const parse_token = ({token, context}: {
    token: Token,
    context: ActivePowerContext
}): NumberValue => {
    if (token.type === "number") return {value: token.value, description: "number"}
    if (token.type === "keyword") return parse_keyword_token({token, context})
    if (token.type === "dice") return {min: 1, max: token.faces}
    if (token.type === "weapon") return {min: 1, max: 4}
    if (token.type === "function") return {min: 1, max: 4}
    throw Error(`token type invalid: ${JSON.stringify(token)}`)
}

const parse_keyword_token = ({token, context}: {
    token: KeywordToken,
    context: ActivePowerContext
}) => {
    const creature = context.get_creature(token.value)
    return parse_creature_property(creature, token.property)
}

const parse_creature_property = (creature: Creature, property: string | undefined) => {
    if (property === undefined) throw Error(`property can't be undefined here`)
    return creature.get_resolved_property(property)
}

export type NumberValue = ResolvedNumberValue | UnresolvedNumberValue

export type ResolvedNumberValue = {
    value: number
    description?: string
}

export type UnresolvedNumberValue = {
    min: number
    max: number
}

const is_resolved_number_value = (value: NumberValue): value is ResolvedNumberValue => value.hasOwnProperty("value")

export const add_all_resolved_number_values = (number_values: Array<ResolvedNumberValue>) => {
    return number_values.reduce((result, x) => x.value + result, 0)
}

export const resolve_all_unresolved_number_values = (number_values: Array<NumberValue>): Array<ResolvedNumberValue> => {
    return number_values.map(x => is_resolved_number_value(x) ? x : {value: get_random_number(x), description: `d4`})
}


type PreviewExpressionProps<T extends Token> = { token: T, context: ActivePowerContext }
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

    if (!token.property) throw Error("creature without a property is not valid")

    return {
        type: "number_resolved",
        ...preview_creature_property({creature, property: token.property}),
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
        return {
            value: creature.attribute_mod(property.slice(0, 3) as any),
            description: property
        }
    if (attributes.some(attribute => `${attribute}_mod_lvl` === property))
        return {
            value: creature.attribute_mod(property.slice(0, 3) as any) + creature.half_level(),
            description: property
        }
    throw Error(`Invalid property ${property}`)

}

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
        case "exists":
        case "equipped":
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

    throw Error(`not all params evaluate to numbers on add function`)
}

export type ExpressionResult = ExpressionResultNumber | ExpressionResultString

type ExpressionResultString = {
    type: "string",
    value: string
    description: string
}

type ExpressionResultNumber = ExpressionResultNumberUnresolved | ExpressionResultNumberResolved

type ExpressionResultNumberUnresolved = {
    type: "number_unresolved"
    min: number
    max: number
    description: string
    params?: Array<ExpressionResult>
}

type ExpressionResultNumberResolved = {
    type: "number_resolved"
    value: number
    description: string
    params?: Array<ExpressionResult>
}

const are_all_numbers = (values: Array<ExpressionResult>): values is Array<ExpressionResultNumber> =>
    values.every(is_number)

const are_all_numbers_unresolved = (values: Array<ExpressionResult>): values is Array<ExpressionResultNumberResolved> =>
    values.every(is_number_resolved)

const is_number_resolved = (value: ExpressionResult): value is ExpressionResultNumberResolved =>
    value.type === "number_resolved"

const is_number_unresolved = (value: ExpressionResult): value is ExpressionResultNumberResolved =>
    value.type === "number_resolved"

const is_number = (value: ExpressionResult): value is ExpressionResultNumberResolved =>
    is_number_resolved(value) || is_number_unresolved(value)
