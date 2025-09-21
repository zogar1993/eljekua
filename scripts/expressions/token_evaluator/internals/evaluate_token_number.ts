import type {AstNodeNumberResolved, InterpretProps} from "expressions/token_evaluator/types";
import type {NumberToken} from "expressions/tokenizer/tokens/NumberToken";

export const evaluate_token_number = ({token}: InterpretProps<NumberToken>): AstNodeNumberResolved =>
    ({type: "number_resolved", value: token.value, description: "hard number"})
