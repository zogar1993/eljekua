import {AstNode, InterpretProps} from "interpreter/types";
import {TokenFunction} from "tokenizer/tokens/TokenFunction";
import {interpret_token_function_add} from "interpreter/specific_interpreters/interpret_token_function_add";
import {interpret_token_function_exists} from "interpreter/specific_interpreters/interpret_token_function_exists";
import {interpret_token_function_equipped} from "interpreter/specific_interpreters/interpret_token_function_equipped";
import {
    interpret_token_function_not_equals
} from "interpreter/specific_interpreters/interpret_token_function_not_equals";
import {
    token_to_has_valid_targets_function_node
} from "interpreter/specific_interpreters/interpret_token_function_has_valid_targets";

export const interpret_function = ({token, ...props}: InterpretProps<TokenFunction>): AstNode => {
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
