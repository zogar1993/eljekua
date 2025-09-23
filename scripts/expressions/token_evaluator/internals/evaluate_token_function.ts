import {AstNode, InterpretProps} from "expressions/token_evaluator/types";
import {TokenFunction} from "expressions/tokenizer/tokens/TokenFunction";
import {evaluate_token_function_add} from "expressions/token_evaluator/internals/evaluate_token_function_add";
import {evaluate_token_function_exists} from "expressions/token_evaluator/internals/evaluate_token_function_exists";
import {evaluate_token_function_equipped} from "expressions/token_evaluator/internals/evaluate_token_function_equipped";
import {
    evaluate_token_function_not_equals
} from "expressions/token_evaluator/internals/evaluate_token_function_not_equals";
import {
    evaluate_token_function_has_valid_targets
} from "expressions/token_evaluator/internals/evaluate_token_function_has_valid_targets";

export const evaluate_token_function = ({token, ...props}: InterpretProps<TokenFunction>): AstNode => {
    switch (token.name) {
        case "add":
            return evaluate_token_function_add({token, ...props})
        case "exists":
            return evaluate_token_function_exists({token, ...props})
        case "equipped":
            return evaluate_token_function_equipped({token, ...props})
        case "not_equals":
            return evaluate_token_function_not_equals({token, ...props})
        case "has_valid_targets":
            return evaluate_token_function_has_valid_targets({token, ...props})
        default:
            throw Error(`function name '${token.name}' not supported when evaluating token`)
    }
}
