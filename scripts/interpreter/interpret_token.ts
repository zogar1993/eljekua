import {roll_d} from "randomness/dice";
import {Creature} from "battlegrid/creatures/Creature";
import {KeywordToken} from "tokenizer/tokens/KeywordToken";
import {Token} from "tokenizer/tokens/AnyToken";
import {TokenFunction} from "tokenizer/tokens/TokenFunction";
import {NumberToken} from "tokenizer/tokens/NumberToken";
import {StringToken} from "tokenizer/tokens/StringToken";
import {DiceToken, WeaponToken} from "tokenizer/tokens/DiceToken";
import {Position} from "battlegrid/Position";
import {ATTRIBUTE_CODES} from "character_sheet/attributes";
import {add_numbers, add_numbers_resolved, is_number, is_number_resolved} from "interpreter/add_numbers";
import {AstNodePosition} from "interpreter/ast_node_position";
import {
    interpret_token_function_not_equals
} from "interpreter/specific_interpreters/interpret_token_function_not_equals";
import {InterpretProps} from "interpreter/types";
import {assert_parameters_amount_equals} from "interpreter/asserts";


export const resolve_number = (number: AstNodeNumber): AstNodeNumberResolved => {
    if (is_number_resolved(number)) return number
    if (number.params === undefined)
        return roll_d(number.max) //TODO this is to be enhanced when randomness apart from dice is added
    const resolved_parts = number.params.map(part => is_number(part) ? resolve_number(part) : part)
    return {
        type: "number_resolved",
        value: resolved_parts.reduce((result, part) => is_number(part) ? part.value + result : result, 0),
        description: number.description,
        params: resolved_parts
    }
}
//TODO change preview verbiage
export const interpret_token = ({token, ...props}: InterpretProps<Token>): AstNode => {
    switch (token.type) {
        case "function":
            return token_to_function_node({token, ...props})
        case "number":
            return token_to_number_node({token, ...props})
        case "string":
            return token_to_string_node({token, ...props})
        case "weapon":
            return token_to_weapon_node({token, ...props})
        case "dice":
            return token_to_dice_node({token, ...props})
        case "keyword":
            return token_to_keyword_node({token, ...props})
    }
}

const token_to_function_node = ({token, ...props}: InterpretProps<TokenFunction>): AstNode => {
    switch (token.name) {
        case "add":
            return token_to_add_function_node({token, ...props})
        case "exists":
            return token_to_exists_function_node({token, ...props})
        case "equipped":
            return token_to_equipped_function_node({token, ...props})
        case "not_equals":
            return interpret_token_function_not_equals({token, ...props})
        case "has_valid_targets":
            return token_to_has_valid_targets_function_node({token, ...props})
        default:
            throw Error(`function name ${token.name} not supported`)
    }
}

const token_to_add_function_node = ({token, ...props}: InterpretProps<TokenFunction>): AstNodeNumber => {
    const params = token.parameters.map(parameter => interpret_token({token: parameter, ...props}))

    if (params.every(is_number_resolved))
        return add_numbers_resolved(params)

    if (params.every(is_number))
        return add_numbers(params)

    throw Error(`not all params evaluate to numbers on add function`)
}

const token_to_exists_function_node = ({token, player_turn_handler}: InterpretProps<TokenFunction>): AstNodeBoolean => {
    assert_parameters_amount_equals(token, 1)
    const parameter = TOKEN.as_keyword(token.parameters[0])

    return {
        type: "boolean",
        value: player_turn_handler.turn_context.get_current_context().has_variable(parameter.value),
        description: `exists ${parameter.value}`,
    }
}

const token_to_equipped_function_node = ({token, ...props}: InterpretProps<TokenFunction>): AstNodeBoolean => {
    assert_parameters_amount_equals(token, 2)
    const creature = NODE.as_creature(token_to_keyword_node({token: TOKEN.as_keyword(token.parameters[0]), ...props}))
    const text = token_to_string_node({token: TOKEN.as_string(token.parameters[1]), ...props})

    return {
        type: "boolean",
        value: creature.value.has_equipped(text.value),
        description: "equipped",
        params: [creature, text]
    }
}

const token_to_has_valid_targets_function_node = ({
                                                      token,
                                                      player_turn_handler
                                                  }: InterpretProps<TokenFunction>): AstNodeBoolean => {
    assert_parameters_amount_equals(token, 1)

    const power_name = TOKEN.as_keyword(token.parameters[0]).value
    const context = player_turn_handler.turn_context.get_current_context()
    const power = context.get_power(power_name)

    const first_instruction = power.instructions[0]

    // If it does not need targets because it does not start with "select_target" we take as it's ok
    let has_valid_targets = true
    if (first_instruction.type === "select_target") {
        const valid_targets = player_turn_handler.get_valid_targets({instruction: first_instruction, context})
        has_valid_targets = valid_targets.length > 0
    }

    return {
        type: "boolean",
        value: has_valid_targets,
        description: "has valid targets"
    }
}


const token_to_keyword_node = ({token, player_turn_handler}: InterpretProps<KeywordToken>): AstNode => {
    const variable_name = token.value
    const variable = player_turn_handler.turn_context.get_current_context().get_variable(variable_name)

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

    if (variable.type === "resolved_number")
        return variable.value

    throw Error("variable type not supported")
}

const ATTRIBUTE_MOD_CODES = ATTRIBUTE_CODES.map(attribute => `${attribute}_mod`)
const ATTRIBUTE_MOD_CODES_LVL = ATTRIBUTE_CODES.map(attribute => `${attribute}_mod_lvl`)

const preview_creature_property = ({creature, property}: {
    creature: Creature,
    property: string
}): Omit<AstNodeNumberResolved, "type"> => {
    if (property === "movement") return {
        value: creature.data.movement,
        description: "movement"
    }

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

const token_to_dice_node = ({token}: InterpretProps<DiceToken>): AstNodeNumberUnresolved =>
    ({type: "number_unresolved", min: 1, max: token.faces, description: `${token.faces}d${token.faces}`})

const token_to_weapon_node = ({token}: InterpretProps<WeaponToken>): AstNodeNumberUnresolved =>
    ({type: "number_unresolved", min: 1, max: 4, description: `${token.amount}W`})

const token_to_string_node = ({token}: InterpretProps<StringToken>): AstNodeString =>
    ({type: "string", value: token.value, description: token.value})

const token_to_number_node = ({token}: InterpretProps<NumberToken>): AstNodeNumberResolved =>
    ({type: "number_resolved", value: token.value, description: "hard number"})

export type AstNode =
    AstNodeNumber
    | AstNodeString
    | AstNodeBoolean
    | AstNodeCreature
    | AstNodePosition
    | AstNodePositions

export type AstNodeString = {
    type: "string",
    value: string
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

export type AstNodePositions = {
    type: "positions"
    value: Array<Position>
    description: string
    params?: Array<AstNode>
}

export const NODE = {
    as_creature: (node: AstNode): AstNodeCreature => {
        if (node.type === "creature") return node
        throw Error(`Cannot cast node to "creature"`)
    },
    as_number: (node: AstNode): AstNodeNumber => {
        if (node.type === "number_resolved") return node
        if (node.type === "number_unresolved") return node
        throw Error(`Cannot cast node to "number"`)
    },
    as_number_resolved: (node: AstNode): AstNodeNumberResolved => {
        if (node.type === "number_resolved") return node
        throw Error(`Cannot cast node to "number_resolved"`)
    },
    as_boolean: (node: AstNode): AstNodeBoolean => {
        if (node.type === "boolean") return node
        throw Error(`Cannot cast node to "boolean"`)
    },
    as_position: (node: AstNode): AstNodePosition => {
        if (node.type === "position") return node
        throw Error(`Cannot cast node to "position"`)
    },
    as_positions: (node: AstNode): AstNodePositions => {
        if (node.type === "positions") return node
        throw Error(`Cannot cast node to "positions"`)
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
