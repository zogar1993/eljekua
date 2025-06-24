import {get_random_number} from "randomness/dice";
import {assert} from "assert";
import {Creature} from "battlegrid/creatures/Creature";
import {ActivePowerContext} from "battlegrid/player_turn_handler/PlayerTurnHandler";
import {KeywordToken} from "tokenizer/tokens/KeywordToken";
import {Token} from "tokenizer/tokens/AnyToken";

export const parse_expression_to_number_values = ({token, context}: {
    token: Token,
    context: ActivePowerContext
}): Array<NumberValue> => {
    return token.type === "function" && token.name === "sum" ?
        token.parameters.map(parameter => parse_token({token: parameter, context})) :
        [parse_token({token, context})]
}

export const parse_expression_to_resolved_number_values = ({token, context}: {
    token: Token,
    context: ActivePowerContext
}): Array<ResolvedNumberValue> => {
    const number_values = token.type === "function" && token.name === "sum" ?
        token.parameters.map(parameter => parse_token({token: parameter, context})) :
        [parse_token({token, context})]

    assert(number_values.every(x => is_resolved_number_value(x)), () => "found unresolved number values")
    return number_values as Array<ResolvedNumberValue>
}

const parse_token = ({token, context}: {
    token: Token,
    context: ActivePowerContext
}): NumberValue => {
    if (token.type === "number") return {value: token.value}
    if (token.type === "keyword") return parse_keyword_token({token, context})
    if (token.type === "dice") return {min: 1, max: token.faces}
    if (token.type === "weapon") return {min: 1, max: 4}
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
