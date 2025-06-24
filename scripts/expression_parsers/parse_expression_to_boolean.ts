import {assert} from "assert";
import {ActivePowerContext} from "battlegrid/player_turn_handler/PlayerTurnHandler";
import {Token} from "tokenizer/tokens/AnyToken";
import {Creature} from "battlegrid/creatures/Creature";

type ExpressionProp = {
    token: Token,
    context: ActivePowerContext
}

export const parse_expression_to_boolean = ({token, context}: ExpressionProp): boolean => {
    if (token.type === "function") {
        if (token.name === "exists") {
            assert(token.parameters.length === 1, () => "exists function needs exactly one parameter")
            const parameter = token.parameters[0]
            if (parameter.type === "keyword")
                return context.has_variable(parameter.value)
            else
                throw Error("exists only works on keywords")

        }
        if (token.name === "equipped") {
            assert(token.parameters.length === 2, () => "equipped function needs exactly two parameter")
            const creature = parse_expression_to_creature({token: token.parameters[0], context})
            const text = parse_expression_to_string({token: token.parameters[1], context})
            return creature.has_equipped(text)
        }
    }

    throw Error("could not resolve tokens to boolean")
}

const parse_expression_to_string = ({token}: ExpressionProp): string => {
    if (token.type !== "string") throw Error("expected a string")
    return token.value
}

const parse_expression_to_creature = ({token, context}: ExpressionProp): Creature => {
    if (token.type !== "keyword") throw Error("expected a keyword")
    if (token.property === null) throw Error("keyword without properties")
    return context.get_creature(token.value)
}