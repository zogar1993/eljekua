import {roll_d} from "randomness/dice";
import {Token} from "tokenizer/tokens/AnyToken";
import {TokenFunction} from "tokenizer/tokens/TokenFunction";
import {DiceToken, WeaponToken} from "tokenizer/tokens/DiceToken";
import {is_number, is_number_resolved} from "interpreter/add_numbers";
import {
    interpret_token_function_not_equals
} from "interpreter/specific_interpreters/interpret_token_function_not_equals";
import {
    AstNode,
    AstNodeNumber,
    AstNodeNumberResolved,
    AstNodeNumberUnresolved,
    InterpretProps
} from "interpreter/types";
import {
    token_to_has_valid_targets_function_node
} from "interpreter/specific_interpreters/interpret_token_function_has_valid_targets";
import {interpret_token_keyword} from "interpreter/specific_interpreters/interpret_token_keyword";
import {interpret_token_function_equipped} from "interpreter/specific_interpreters/interpret_token_function_equipped";
import {interpret_token_string} from "interpreter/specific_interpreters/interpret_token_string";
import {interpret_token_function_exists} from "interpreter/specific_interpreters/interpret_token_function_exists";
import {interpret_token_function_add} from "interpreter/specific_interpreters/interpret_token_function_add";
import {interpret_number} from "interpreter/specific_interpreters/interpret_number";

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

const token_to_function_node = ({token, ...props}: InterpretProps<TokenFunction>): AstNode => {
    switch (token.name) {
        case "add":
            return interpret_token_function_add({token, ...props})
        case "exists":
            return interpret_token_function_exists({token, ...props})
        case "equipped":
            return interpret_token_function_equipped({token, ...props})
        case "not_equals":
            return interpret_token_function_not_equals({token, ...props})
        case "has_valid_targets":
            return token_to_has_valid_targets_function_node({token, ...props})
        default:
            throw Error(`function name ${token.name} not supported`)
    }
}

const interpret_dice = ({token}: InterpretProps<DiceToken>): AstNodeNumberUnresolved =>
    ({type: "number_unresolved", min: 1, max: token.faces, description: `${token.faces}d${token.faces}`})

const interpret_weapon = ({token}: InterpretProps<WeaponToken>): AstNodeNumberUnresolved =>
    ({type: "number_unresolved", min: 1, max: 4, description: `${token.amount}W`})

