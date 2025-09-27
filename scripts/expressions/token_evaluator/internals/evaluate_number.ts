import type {AstNodeNumberResolved} from "expressions/token_evaluator/types";
import type {NumberToken} from "expressions/tokenizer/tokens/NumberToken";

export const evaluate_number = (token: NumberToken): AstNodeNumberResolved =>
    ({type: "number_resolved", value: token.value, description: "hard number"})

