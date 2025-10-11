import type {AstNodeString} from "scripts/expressions/token_evaluator/types";
import type {StringToken} from "scripts/expressions/tokenizer/tokens/StringToken";

export const evaluate_string = (token: StringToken): AstNodeString =>
    ({type: "string", value: token.value, description: token.value})
