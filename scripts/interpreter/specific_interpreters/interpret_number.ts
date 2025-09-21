import type {AstNodeNumberResolved, InterpretProps} from "interpreter/types";
import type {NumberToken} from "tokenizer/tokens/NumberToken";

export const interpret_number = ({token}: InterpretProps<NumberToken>): AstNodeNumberResolved =>
    ({type: "number_resolved", value: token.value, description: "hard number"})
