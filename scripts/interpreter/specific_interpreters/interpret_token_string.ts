import type {AstNodeString, InterpretProps} from "interpreter/types";
import type {StringToken} from "tokenizer/tokens/StringToken";

export const interpret_token_string = ({token}: InterpretProps<StringToken>): AstNodeString =>
    ({type: "string", value: token.value, description: token.value})
