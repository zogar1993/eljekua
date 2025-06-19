import {Creature} from "battlegrid/BattleGrid";
import {PlayerTurnHandler} from "battlegrid/player_turn_handler/PlayerTurnHandler";
import {get_random_number} from "randomness/dice";
import {KeywordToken, Token} from "tokenizer/tokenize";
import {assert} from "assert";


export class IntFormulaFromTokens {
    private readonly player_control: PlayerTurnHandler
    private readonly number_values: Array<NumberValue>

    constructor(tokens: Array<Token>, player_control: PlayerTurnHandler) {
        this.player_control = player_control
        this.number_values = tokens.map(this.parse_token)
    }

    parse_token = (token: Token) => {
        if (token.type === "number") return {value: token.value}
        if (token.type === "keyword") return {value: this.parse_keyword_token(token)}
        if (token.type === "dice") return {min: 1, max: token.faces}
        throw Error(`token type invalid: ${token}`)
    }

    parse_keyword_token = (token: KeywordToken) => {
        assert(token.type === "keyword", () => `token is not of keword type: ${token}`)
        const creature = this.parse_keyword(token.value)
        return this.parse_creature_property(creature, token.property)
    }

    parse_keyword = (keyword: string) => {
        if (keyword === "owner") return this.player_control.get_selected_creature()
        throw Error(`Invalid keyword ${keyword}`)
    }

    parse_creature_property = (creature: Creature, property: string | undefined) => {
        if (property === undefined) throw Error(`property can't be undefined here`)
        if (property === "movement") return creature.data.movement
        throw Error(`Invalid property ${property}`)
    }

    get_resolved_number_values = (): Array<ResolvedNumberValue> => {
        assert(this.number_values.every(x => is_resolved_number_value(x)), () => "found unresolved number values")
        return this.number_values as Array<ResolvedNumberValue>
    }

    get_all_number_values = (): Array<NumberValue> => {
        return this.number_values
    }
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
