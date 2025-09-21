import type {AstNodeNumberUnresolved, InterpretProps} from "interpreter/types";
import type {WeaponToken} from "tokenizer/tokens/DiceToken";

export const interpret_weapon = ({token}: InterpretProps<WeaponToken>): AstNodeNumberUnresolved =>
    ({type: "number_unresolved", min: 1, max: 4, description: `${token.amount}W`})
