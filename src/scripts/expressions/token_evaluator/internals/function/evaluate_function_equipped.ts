import type {AstNodeBoolean} from "scripts/expressions/token_evaluator/types";
import type {TokenFunction} from "scripts/expressions/tokenizer/tokens/TokenFunction";
import {assert_parameters_amount_equals} from "scripts/expressions/token_evaluator/asserts";
import {NODE} from "scripts/expressions/token_evaluator/NODE";
import {TOKEN} from "scripts/expressions/token_evaluator/TOKEN";
import type {Token} from "scripts/expressions/tokenizer/tokens/AnyToken";
import type {AstNode} from "scripts/expressions/token_evaluator/types";

export const evaluate_function_equipped = ({token, evaluate_token}:
                                               {
                                                   token: TokenFunction,
                                                   evaluate_token: (token: Token) => AstNode,
                                               }): AstNodeBoolean => {
    assert_parameters_amount_equals(token, 2)
    const creature = NODE.as_creature(evaluate_token(TOKEN.as_keyword(token.parameters[0])))
    const text = NODE.as_string(evaluate_token(TOKEN.as_string(token.parameters[1])))

    return {
        type: "boolean",
        value: creature.value.has_equipped(text.value),
        description: "equipped",
        params: [creature, text]
    }
}
