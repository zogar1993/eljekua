import type {AstNodeString, InterpretProps} from "expressions/token_evaluator/types";
import type {StringToken} from "expressions/tokenizer/tokens/StringToken";

export const evaluate_token_string = ({token}: InterpretProps<StringToken>): AstNodeString =>
    ({type: "string", value: token.value, description: token.value})
