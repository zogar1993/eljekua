import type {AstNodeNumberUnresolved} from "expressions/token_evaluator/types";
import type {DiceToken} from "expressions/tokenizer/tokens/RollToken";

export const evaluate_dice = (token: DiceToken): AstNodeNumberUnresolved =>
    ({type: "number_unresolved", min: 1, max: token.faces, description: `${token.faces}d${token.faces}`})
