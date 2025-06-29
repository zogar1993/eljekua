import {get_random_number} from "randomness/dice";
import {assert} from "assert";
import {Creature} from "battlegrid/creatures/Creature";
import {KeywordToken} from "tokenizer/tokens/KeywordToken";
import {Token} from "tokenizer/tokens/AnyToken";
import {FunctionToken} from "tokenizer/tokens/FunctionToken";
import {NumberToken} from "tokenizer/tokens/NumberToken";
import {StringToken} from "tokenizer/tokens/StringToken";
import {DiceToken, WeaponToken} from "tokenizer/tokens/DiceToken";
import {Position} from "battlegrid/Position";
import {ActivePowerContext} from "battlegrid/player_turn_handler/ActivePowerContext";

type PreviewExpressionProps<T extends Token> = { token: T, context: ActivePowerContext }

export const resolve_number = (number: AstNodeNumber): AstNodeNumberResolved => {
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

export const preview_expression = ({token, context}: PreviewExpressionProps<Token>): AstNode => {
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

const preview_function = ({token, context}: PreviewExpressionProps<FunctionToken>): AstNode => {
    switch (token.name) {
        case "add":
            return preview_add_function({token, context})
        case "exists":
            return preview_exists_function({token, context})
        case "equipped":
            return preview_equipped_function({token, context})
        case "not_equals":
            return preview_not_equals_function({token, context})
        default:
            throw Error(`function name ${token.name} not supported`)
    }
}

const preview_add_function = ({token, context}: PreviewExpressionProps<FunctionToken>): AstNodeNumber => {
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

const preview_exists_function = ({token, context}: PreviewExpressionProps<FunctionToken>): AstNodeBoolean => {
    assert_parameters_amount_equals(token, 1)
    const parameter = TOKEN.as_keyword(token.parameters[0])

    return {
        type: "boolean",
        value: context.has_variable(parameter.value),
        description: `exists ${parameter.value}`,
    }
}

const preview_equipped_function = ({
                                       token,
                                       context
                                   }: PreviewExpressionProps<FunctionToken>): AstNodeBoolean => {
    assert_parameters_amount_equals(token, 2)
    const creature = NODE.as_creature(preview_keyword({token: TOKEN.as_keyword(token.parameters[0]), context}))
    const text = preview_string({token: TOKEN.as_string(token.parameters[1]), context})

    return {
        type: "boolean",
        value: creature.value.has_equipped(text.value),
        description: "equipped",
        params: [creature, text]
    }
}

const preview_not_equals_function = ({token, context}: PreviewExpressionProps<FunctionToken>): AstNodeBoolean => {
    assert_parameters_amount_equals(token, 2)

    const parameter1 = preview_expression({token: token.parameters[0], context})
    const parameter2 = preview_expression({token: token.parameters[1], context})

    if (parameter1.type === "position" && parameter2.type === "position") {
        const position1 = parameter1.value
        const position2 = parameter2.value
        const are_equal = position1.x === position2.x && position1.y === position2.y

        return {
            type: "boolean",
            value: !are_equal,
            description: "not_equals",
            params: [parameter1, parameter2]
        }
    }
    throw Error(`not_equals parameters dont match, got ${parameter1.type} and ${parameter2.type}`)
}


const preview_keyword = ({token, context}: PreviewExpressionProps<KeywordToken>): AstNode => {
    const variable = context.get_variable(token.value)

    if (variable.type === "position")
        return {
            type: "position",
            value: variable.value,
            description: token.value
        }

    if (variable.type === "creature") {
        const creature = variable.value

        if (token.property) {
            if (token.property === "position")
                return {
                    type: "position",
                    value: creature.data.position,
                    description: `${creature.data.name}'s position`
                }
            return {
                type: "number_resolved",
                ...preview_creature_property({creature, property: token.property}),
            }
        } else
            return {
                type: "creature",
                value: creature,
                description: creature.data.name
            }
    }

    throw Error("variable type not supported")
}

const preview_creature_property = ({creature, property}: {
    creature: Creature,
    property: string
}): Omit<AstNodeNumberResolved, "type"> => {
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

const preview_creature_half_level = (creature: Creature): AstNodeNumberResolved =>
    ({type: "number_resolved", value: creature.half_level(), description: "half level"})

const preview_creature_attribute_mod = (creature: Creature, attribute: keyof Creature["data"]["attributes"]): AstNodeNumberResolved =>
    ({type: "number_resolved", value: creature.attribute_mod(attribute), description: `${attribute}_mod`})

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

const preview_dice = ({token}: PreviewExpressionProps<DiceToken>): AstNodeNumberUnresolved =>
    ({type: "number_unresolved", min: 1, max: token.faces, description: `${token.faces}d${token.faces}`})

const preview_weapon = ({token}: PreviewExpressionProps<WeaponToken>): AstNodeNumberUnresolved =>
    ({type: "number_unresolved", min: 1, max: 4, description: `${token.amount}W`})

const preview_string = ({token}: PreviewExpressionProps<StringToken>): AstNodeString =>
    ({type: "string", value: token.value, description: token.value})

const preview_number = ({token}: PreviewExpressionProps<NumberToken>): AstNodeNumberResolved =>
    ({type: "number_resolved", value: token.value, description: "hard number"})

export type AstNode =
    AstNodeNumber
    | AstNodeString
    | AstNodeBoolean
    | AstNodeCreature
    | AstNodePosition

export type AstNodeString = {
    type: "string",
    value: string
    description: string
}

export type AstNodePosition = {
    type: "position",
    value: Position
    description: string
}

export type AstNodeNumber = AstNodeNumberUnresolved | AstNodeNumberResolved

export type AstNodeNumberUnresolved = {
    type: "number_unresolved"
    min: number
    max: number
    description: string
    params?: Array<AstNode>
}

export type AstNodeNumberResolved = {
    type: "number_resolved"
    value: number
    description: string
    params?: Array<AstNode>
}

export type AstNodeCreature = {
    type: "creature"
    value: Creature
    description: string
}

export type AstNodeBoolean = {
    type: "boolean"
    value: boolean
    description: string
    params?: Array<AstNode>
}

const are_all_numbers = (values: Array<AstNode>): values is Array<AstNodeNumber> =>
    values.every(is_number)

const are_all_numbers_unresolved = (values: Array<AstNode>): values is Array<AstNodeNumberResolved> =>
    values.every(is_number_resolved)

const is_number_resolved = (value: AstNode): value is AstNodeNumberResolved =>
    value.type === "number_resolved"

const is_number_unresolved = (value: AstNode): value is AstNodeNumberUnresolved =>
    value.type === "number_unresolved"

export const is_number = (value: AstNode): value is AstNodeNumber =>
    is_number_resolved(value) || is_number_unresolved(value)

const assert_parameters_amount_equals = (token: FunctionToken, amount: number) =>
    assert(token.parameters.length === amount, () => "equipped function needs exactly two parameter")

const NODE = {
    as_creature: (node: AstNode): AstNodeCreature => {
        if (node.type === "creature") return node
        throw Error(`Cannot cast node to "creature"`)
    }
}

const TOKEN = {
    as_keyword: (token: Token): KeywordToken => {
        if (token.type === "keyword") return token
        throw Error(`Cannot cast token to "keyword"`)
    },
    as_string: (token: Token): StringToken => {
        if (token.type === "string") return token
        throw Error(`Cannot cast token to "string"`)
    }
}
