import type {AstNodeBoolean} from "expressions/token_evaluator/types";
import type {TokenFunction} from "expressions/tokenizer/tokens/TokenFunction";
import {assert_parameters_amount_equals} from "expressions/token_evaluator/asserts";
import {NODE} from "expressions/token_evaluator/NODE";
import {TOKEN} from "expressions/token_evaluator/TOKEN";
import type {Token} from "expressions/tokenizer/tokens/AnyToken";
import type {AstNode} from "expressions/token_evaluator/types";
import {evaluate_token} from "expressions/token_evaluator/evaluate_token";

export const evaluate_function_equipped = ({token}:
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
