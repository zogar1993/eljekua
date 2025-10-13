import type {AstNodeNumberUnresolved} from "scripts/expressions/token_evaluator/types";
import type {WeaponToken} from "scripts/expressions/tokenizer/tokens/RollToken";
import {number_utils} from "scripts/expressions/token_evaluator/number_utils";

export const evaluate_weapon = (token: WeaponToken): AstNodeNumberUnresolved => {
    const node: AstNodeNumberUnresolved = {type: "number_unresolved", min: 1, max: 4, description: `W`}
    return {...number_utils(Array.from({length: token.amount}, () => node)), description: `${token.amount}W`}
}

