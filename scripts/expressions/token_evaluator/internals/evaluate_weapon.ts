import type {AstNodeNumberUnresolved} from "expressions/token_evaluator/types";
import type {WeaponToken} from "expressions/tokenizer/tokens/RollToken";

export const evaluate_weapon = (token: WeaponToken): AstNodeNumberUnresolved =>
    ({type: "number_unresolved", min: 1, max: 4, description: `${token.amount}W`})
