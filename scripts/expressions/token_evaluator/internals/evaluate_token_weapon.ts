import type {AstNodeNumberUnresolved, InterpretProps} from "expressions/token_evaluator/types";
import type {WeaponToken} from "expressions/tokenizer/tokens/DiceToken";

export const evaluate_token_weapon = ({token}: InterpretProps<WeaponToken>): AstNodeNumberUnresolved =>
    ({type: "number_unresolved", min: 1, max: 4, description: `${token.amount}W`})
