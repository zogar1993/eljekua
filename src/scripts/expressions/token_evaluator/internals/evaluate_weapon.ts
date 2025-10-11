import type {AstNodeNumberUnresolved} from "scripts/expressions/token_evaluator/types";
import type {WeaponToken} from "scripts/expressions/tokenizer/tokens/RollToken";
import {add_numbers} from "scripts/expressions/token_evaluator/add_numbers";

export const evaluate_weapon = (token: WeaponToken): AstNodeNumberUnresolved => {
    const node: AstNodeNumberUnresolved = {type: "number_unresolved", min: 1, max: 4, description: `W`}
    return {...add_numbers(Array.from({length: token.amount}, () => node)), description: `${token.amount}W`}
}

