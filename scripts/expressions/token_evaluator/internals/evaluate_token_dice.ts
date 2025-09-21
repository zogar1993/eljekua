import type {AstNodeNumberUnresolved, InterpretProps} from "expressions/token_evaluator/types";
import type {DiceToken} from "expressions/tokenizer/tokens/DiceToken";

export const evaluate_token_dice = ({token}: InterpretProps<DiceToken>): AstNodeNumberUnresolved =>
    ({type: "number_unresolved", min: 1, max: token.faces, description: `${token.faces}d${token.faces}`})
