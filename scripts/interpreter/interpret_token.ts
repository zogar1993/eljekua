import {roll_d} from "randomness/dice";
import {Token} from "tokenizer/tokens/AnyToken";
import {is_number, is_number_resolved} from "interpreter/add_numbers";
import {AstNode, AstNodeNumber, AstNodeNumberResolved, InterpretProps} from "interpreter/types";
import {interpret_token_keyword} from "interpreter/specific_interpreters/interpret_token_keyword";
import {interpret_token_string} from "interpreter/specific_interpreters/interpret_token_string";
import {interpret_number} from "interpreter/specific_interpreters/interpret_number";
import {interpret_weapon} from "interpreter/specific_interpreters/interpret_weapon";
import {interpret_dice} from "interpreter/specific_interpreters/interpret_dice";
import {interpret_function} from "interpreter/specific_interpreters/interpret_function";

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
            return interpret_function({token, ...props})
        case "number":
            return interpret_number({token, ...props})
        case "string":
            return interpret_token_string({token, ...props})
        case "weapon":
            return interpret_weapon({token, ...props})
        case "dice":
            return interpret_dice({token, ...props})
        case "keyword":
            return interpret_token_keyword({token, ...props})
    }
}

