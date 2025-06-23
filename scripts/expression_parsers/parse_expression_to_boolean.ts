import {Token} from "tokenizer/tokenize";
import {assert} from "assert";
import {ActivePowerContext} from "battlegrid/player_turn_handler/PlayerTurnHandler";

export const parse_expression_to_boolean = ({token, context}: {token: Token, context: ActivePowerContext}): boolean => {
    if(token.type === "function") {
        if (token.name === "exists") {
            assert(token.parameters.length === 1, () => "exists function needs exactly one parameter")
            const parameter = token.parameters[0]
            if (parameter.type === "keyword")
                return context.has_variable(parameter.value)
        }
    }

    throw Error("could not resolve tokens to boolean")
}