import type {AstNodeString} from "expressions/token_evaluator/types";
import type {StringToken} from "expressions/tokenizer/tokens/StringToken";

export const evaluate_string = (token: StringToken): AstNodeString =>
    ({type: "string", value: token.value, description: token.value})
