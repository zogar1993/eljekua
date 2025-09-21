import type {AstNodeNumberUnresolved, InterpretProps} from "interpreter/types";
import type {DiceToken} from "tokenizer/tokens/DiceToken";

export const interpret_dice = ({token}: InterpretProps<DiceToken>): AstNodeNumberUnresolved =>
    ({type: "number_unresolved", min: 1, max: token.faces, description: `${token.faces}d${token.faces}`})
